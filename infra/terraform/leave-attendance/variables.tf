variable "environment" {
  description = "Environment name (dev, stg, prd)"
  type        = string
  validation {
    condition     = contains(["dev", "stg", "prd"], var.environment)
    error_message = "Environment must be dev, stg, or prd"
  }
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

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
  default     = "ap-southeast-2_hTAYJId8y"
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

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}

