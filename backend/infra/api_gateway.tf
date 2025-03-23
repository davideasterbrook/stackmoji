# API Gateway
resource "aws_apigatewayv2_api" "emoji_api" {
  name          = "emoji-game-api-${random_string.suffix.result}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]  # Consider restricting this to your frontend domain in production
    allow_methods = ["GET", "OPTIONS"]
    allow_headers = ["content-type", "x-amz-date", "authorization", "x-api-key", "x-amz-security-token"]
    max_age      = 300
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id = aws_apigatewayv2_api.emoji_api.id
  name   = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id           = aws_apigatewayv2_api.emoji_api.id
  integration_type = "AWS_PROXY"

  integration_uri    = aws_lambda_function.daily_game.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "get_game" {
  api_id    = aws_apigatewayv2_api.emoji_api.id
  route_key = "GET /daily-game"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.daily_game.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.emoji_api.execution_arn}/*/*"
} 