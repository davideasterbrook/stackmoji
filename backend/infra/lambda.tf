# Lambda function
resource "aws_lambda_function" "daily_generator" {
  source_code_hash = filebase64sha256("lambda_function.zip")
  filename         = "lambda_function.zip"
  function_name    = "${var.project_name}-daily-generator"
  role            = aws_iam_role.lambda_role.arn
  handler         = "update_daily_game.lambda_handler"
  runtime         = "python3.12"
  timeout         = 20
  memory_size     = 1769  # Gives 1 vCPU
  architectures   = ["arm64"]

  environment {
    variables = {
      POWERTOOLS_LOG_LEVEL = "INFO"
      POWERTOOLS_SERVICE_NAME = "${var.project_name}"
      BUCKET_NAME = aws_s3_bucket.game_data.id
      FRONTEND_BUCKET_NAME = aws_s3_bucket.frontend.id
      CLOUDFRONT_DISTRIBUTION_ID = aws_cloudfront_distribution.frontend.id
    }
  }
}

# Add CloudWatch Log Group with retention
resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.daily_generator.function_name}"
  retention_in_days = 90
} 