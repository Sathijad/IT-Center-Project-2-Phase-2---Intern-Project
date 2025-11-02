terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "itcenter-terraform-state"
    key    = "leave-attendance/terraform.tfstate"
    region = "ap-southeast-2"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment   = var.environment
      Project       = "ITCenter-Phase2"
      ManagedBy     = "Terraform"
      Application   = "leave-attendance-api"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}

# Variables
variable "environment" {
  description = "Environment name (dev, stg, prd)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-2"
}

variable "api_version" {
  description = "API version"
  type        = string
  default     = "v1"
}

# Outputs
output "api_gateway_url" {
  description = "API Gateway base URL"
  value       = aws_api_gateway_rest_api.api.execution_arn
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.api.function_name
}

# S3 bucket for Lambda deployment package
resource "aws_s3_bucket" "lambda_deploy" {
  bucket = "itcenter-leave-attendance-${var.environment}-lambda-deploy"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "lambda_deploy" {
  bucket = aws_s3_bucket.lambda_deploy.id

  versioning_configuration {
    status = "Enabled"
  }
}

# IAM role for Lambda
resource "aws_iam_role" "lambda" {
  name = "leave-attendance-api-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for Lambda
resource "aws_iam_role_policy" "lambda" {
  name = "leave-attendance-api-${var.environment}-lambda-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:*:*:secret:leave-attendance-${var.environment}/*"
      }
    ]
  })
}

# Lambda function
resource "aws_lambda_function" "api" {
  function_name    = "leave-attendance-api-${var.environment}"
  role            = aws_iam_role.lambda.arn
  handler         = "dist/server.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 512

  s3_bucket = aws_s3_bucket.lambda_deploy.bucket
  s3_key    = "leave-attendance-api.zip"

  environment {
    variables = {
      NODE_ENV              = var.environment
      ENVIRONMENT           = var.environment
      COGNITO_USER_POOL_ID  = var.cognito_user_pool_id
      DB_SECRET_ARN         = aws_secretsmanager_secret.db.arn
    }
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  depends_on = [
    aws_iam_role_policy.lambda,
    aws_cloudwatch_log_group.lambda
  ]
}

# CloudWatch log group
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/leave-attendance-api-${var.environment}"
  retention_in_days = 7
}

# API Gateway
resource "aws_api_gateway_rest_api" "api" {
  name        = "leave-attendance-api-${var.environment}"
  description = "IT Center Phase 2 - Leave & Attendance Management API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}

resource "aws_api_gateway_deployment" "api" {
  depends_on = [
    aws_api_gateway_method.proxy,
    aws_api_gateway_integration.lambda,
  ]

  rest_api_id = aws_api_gateway_rest_api.api.id
  stage_name  = var.environment
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# SQS queue for calendar sync
resource "aws_sqs_queue" "calendar_sync" {
  name                       = "leave-attendance-calendar-sync-${var.environment}"
  visibility_timeout_seconds = 300
  message_retention_seconds  = 1209600 # 14 days

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.calendar_sync_dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue" "calendar_sync_dlq" {
  name                      = "leave-attendance-calendar-sync-dlq-${var.environment}"
  message_retention_seconds = 1209600 # 14 days
}

# Secrets Manager for database credentials
resource "aws_secretsmanager_secret" "db" {
  name = "leave-attendance-${var.environment}-db-credentials"
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = "itcenter"
    password = "change-me-in-production"
    host     = var.db_host
    port     = 5432
    database = "itcenter_auth"
  })
}

# Security group for Lambda
resource "aws_security_group" "lambda" {
  name        = "leave-attendance-lambda-${var.environment}"
  description = "Security group for Lambda function"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# CloudWatch alarms
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "leave-attendance-api-${var.environment}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "This metric monitors lambda errors"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    FunctionName = aws_lambda_function.api.function_name
  }
}

resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "leave-attendance-api-${var.environment}-lambda-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Average"
  threshold           = 1000 # 1 second
  alarm_description   = "This metric monitors lambda duration"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    FunctionName = aws_lambda_function.api.function_name
  }
}

resource "aws_cloudwatch_metric_alarm" "sqs_dlq_depth" {
  alarm_name          = "leave-attendance-calendar-sync-${var.environment}-dlq-depth"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "This metric monitors SQS DLQ depth"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    QueueName = aws_sqs_queue.calendar_sync_dlq.name
  }
}

# SNS topic for alerts
resource "aws_sns_topic" "alerts" {
  name = "leave-attendance-${var.environment}-alerts"
}

# Additional variables
variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for Lambda VPC"
  type        = list(string)
  default     = []
}

variable "db_host" {
  description = "Database host"
  type        = string
  default     = "localhost"
}

