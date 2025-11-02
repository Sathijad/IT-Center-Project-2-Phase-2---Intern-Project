# Leave & Attendance API - Terraform Infrastructure

Infrastructure as Code for deploying the Leave & Attendance API to AWS.

## Architecture

- **API Gateway**: REST API endpoint
- **Lambda**: Node.js function execution
- **SQS**: Calendar sync job queue
- **CloudWatch**: Logging and monitoring
- **Secrets Manager**: Database credentials
- **SNS**: Alert notifications

## Prerequisites

```bash
# Install Terraform
# Windows (using Chocolatey)
choco install terraform

# macOS
brew install terraform

# Linux
# Download from https://www.terraform.io/downloads
```

## Configuration

### Backend State

Configure S3 backend in `main.tf`:
```hcl
backend "s3" {
  bucket = "your-terraform-state-bucket"
  key    = "leave-attendance/terraform.tfstate"
  region = "ap-southeast-2"
}
```

### Variables

Create `terraform.tfvars`:
```hcl
environment        = "dev"
aws_region         = "ap-southeast-2"
cognito_user_pool_id = "ap-southeast-2_hTAYJId8y"
subnet_ids         = ["subnet-xxx", "subnet-yyy"]
db_host            = "your-rds-endpoint"
```

## Deployment

### Initialize

```bash
cd infra/terraform/leave-attendance
terraform init
```

### Plan

```bash
terraform plan -var-file="terraform.tfvars"
```

### Apply

```bash
terraform apply -var-file="terraform.tfvars"
```

### Destroy

```bash
terraform destroy -var-file="terraform.tfvars"
```

## Environments

Deploy to different environments:

```bash
# Development
terraform workspace select dev
terraform apply -var="environment=dev"

# Staging
terraform workspace select stg
terraform apply -var="environment=stg"

# Production
terraform workspace select prd
terraform apply -var="environment=prd"
```

## Lambda Deployment

Before deploying Lambda, build the package:

```bash
cd leave-attendance-api
npm run build
zip -r ../leave-attendance-api.zip dist/ node_modules/
```

Upload to S3:
```bash
aws s3 cp leave-attendance-api.zip s3://itcenter-leave-attendance-dev-lambda-deploy/
```

## Monitoring

CloudWatch alarms configured for:
- Lambda errors (> 5 in 5 min)
- Lambda duration (> 1s)
- SQS DLQ depth (> 50 messages)

Alerts sent to SNS topic.

## Costs

Estimated monthly costs (for dev environment):
- API Gateway: $3.50 per million requests
- Lambda: Free tier (1M free requests/month)
- CloudWatch: First 5GB free
- SQS: Free tier (1M requests/month)
- Secrets Manager: $0.40 per secret

Total: ~$1-10/month for dev

## Security

- Secrets stored in AWS Secrets Manager
- IAM roles with least privilege
- VPC integration for Lambda (optional)
- CloudWatch logging for audit trail
- WAF rules (add via separate module)

## Troubleshooting

### Lambda timeout
- Increase timeout in `main.tf`
- Check CloudWatch logs for errors

### API Gateway 502
- Check Lambda logs
- Verify IAM permissions
- Check integration configuration

### SQS messages not processing
- Check Lambda DLQ depth
- Verify visibility timeout
- Check Lambda concurrency limits

## References

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)

