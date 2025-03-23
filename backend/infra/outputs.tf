output "api_endpoint" {
  value = aws_apigatewayv2_api.emoji_api.api_endpoint
}

output "function_name" {
  value = aws_lambda_function.daily_game.function_name
} 