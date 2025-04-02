resource "aws_s3_bucket" "game_data" {
  bucket = "${var.project_name}-daily-game"
}

resource "aws_s3_bucket_public_access_block" "game_data" {
  bucket = aws_s3_bucket.game_data.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "game_data" {
  bucket = aws_s3_bucket.game_data.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.game_data.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_cors_configuration" "game_data" {
  bucket = aws_s3_bucket.game_data.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = var.allowed_origins
    expose_headers  = []
    max_age_seconds = 3600
  }
} 