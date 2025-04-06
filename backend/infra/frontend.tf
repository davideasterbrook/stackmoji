# S3 bucket for website hosting
resource "aws_s3_bucket" "frontend" {
  bucket = "stackmoji-frontend"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled    = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend.bucket}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.frontend.bucket}"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.www_redirect.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.frontend.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # Handle SPA routing
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  aliases = ["stackmoji.com", "www.stackmoji.com"]
}

# CloudFront OAI
resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "OAI for stackmoji.com"
}

# ACM Certificate
resource "aws_acm_certificate" "frontend" {
  provider          = aws.us-east-1  # Certificate must be in us-east-1 for CloudFront
  domain_name       = "stackmoji.com"
  validation_method = "DNS"
  
  subject_alternative_names = ["*.stackmoji.com"]

  lifecycle {
    create_before_destroy = true
  }
}

# S3 bucket policy
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontOAI"
        Effect    = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.frontend.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

# CloudFront function for www redirect
resource "aws_cloudfront_function" "www_redirect" {
  name    = "www-redirect"
  runtime = "cloudfront-js-1.0"
  publish = true
  code    = <<-EOF
function handler(event) {
  var request = event.request;
  var headers = request.headers;
  var host = headers.host.value;
  
  if (host === 'stackmoji.com') {
    // Build query string if it exists
    var queryString = '';
    if (request.querystring) {
      var params = [];
      for (var key in request.querystring) {
        params.push(key + '=' + request.querystring[key].value);
      }
      if (params.length > 0) {
        queryString = '?' + params.join('&');
      }
    }
    
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        'location': { value: 'https://www.stackmoji.com' + request.uri + queryString },
        'cache-control': { value: 'max-age=3600' }
      }
    };
  }
  
  return request;
}
EOF
}
