# Lambda function
resource "aws_lambda_function" "daily_game" {
  source_code_hash = filebase64sha256("lambda_function.zip")
  filename         = "lambda_function.zip"
  function_name    = "emoji-daily-game-${random_string.suffix.result}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "update_daily_game.lambda_handler"
  runtime         = "python3.12"
  timeout         = 10
  memory_size     = 128 # Minimal memory for cost savings

  environment {
    variables = {
      SSM_PARAMETER_NAME = "/emoji-shadows/daily-game"
      POWERTOOLS_LOG_LEVEL = "DEBUG"
      POWERTOOLS_SERVICE_NAME = "EMOJI-GAME"
    }
  }
}

# Add CloudWatch Log Group with retention
resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.daily_game.function_name}"
  retention_in_days = 90
} 