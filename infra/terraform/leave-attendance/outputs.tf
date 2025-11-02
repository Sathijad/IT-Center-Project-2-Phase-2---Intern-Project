output "api_gateway_url" {
  description = "API Gateway base URL"
  value       = "https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.aws_region}.amazonaws.com/${var.environment}"
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_api_gateway_rest_api.api.id
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.api.function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.api.arn
}

output "sqs_queue_url" {
  description = "SQS calendar sync queue URL"
  value       = aws_sqs_queue.calendar_sync.url
}

output "sqs_dlq_url" {
  description = "SQS DLQ URL"
  value       = aws_sqs_queue.calendar_sync_dlq.url
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.lambda.name
}

output "secrets_manager_arn" {
  description = "Secrets Manager ARN for DB credentials"
  value       = aws_secretsmanager_secret.db.arn
}

output "sns_topic_arn" {
  description = "SNS alert topic ARN"
  value       = aws_sns_topic.alerts.arn
}

