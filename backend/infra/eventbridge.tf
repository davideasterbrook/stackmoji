# EventBridge rule to trigger Lambda at midnight UTC
resource "aws_cloudwatch_event_rule" "daily_trigger" {
  name                = "emoji-game-daily-trigger-${random_string.suffix.result}"
  description         = "Triggers the emoji game Lambda function daily at midnight UTC"
  schedule_expression = "cron(0 0 * * ? *)"
}

resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.daily_trigger.name
  target_id = "EmojigameLambda"
  arn       = aws_lambda_function.daily_game.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.daily_game.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_trigger.arn
} 