# Lambda layer for emoji package
resource "aws_lambda_layer_version" "emoji_layer" {
  filename            = "lambda_layer.zip" # You'll need to create this
  layer_name         = "emoji-package-layer"
  compatible_runtimes = ["python3.9"]
  description        = "Layer containing emoji package"
}

# Lambda function
resource "aws_lambda_function" "daily_game" {
  filename         = "lambda_function.zip" # You'll need to create this
  function_name    = "emoji-daily-game-${random_string.suffix.result}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "update_daily_game.lambda_handler"
  runtime         = "python3.9"
  timeout         = 10
  memory_size     = 128 # Minimal memory for cost savings

  layers = [aws_lambda_layer_version.emoji_layer.arn]

  environment {
    variables = {
      SSM_PARAMETER_NAME = "/emoji-shadows/daily-game"
    }
  }
} 