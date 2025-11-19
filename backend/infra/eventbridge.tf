# EventBridge rule to trigger Lambda at midnight UTC
resource "aws_cloudwatch_event_rule" "daily_trigger" {
  name                = "${var.project_name}-daily-generator"
  description         = "Triggers daily game generation"
  schedule_expression = "cron(0 0 * * ? *)"  # Run at midnight UTC
}

resource "aws_cloudwatch_event_target" "daily_generator" {
  rule      = aws_cloudwatch_event_rule.daily_trigger.name
  target_id = "DailyGameGenerator"
  arn       = aws_lambda_function.daily_generator.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.daily_generator.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_trigger.arn
} 