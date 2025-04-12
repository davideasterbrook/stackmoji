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
      function_arn = aws_cloudfront_function.url_rewrite.arn
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

  # Handle 404 errors - redirect to 404.html to support proper error handling
  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/404.html"
    error_caching_min_ttl = 300
  }

  # Handle 403 errors from S3 - show 404.html since it's likely a "not found" case
  custom_error_response {
    error_code         = 403
    response_code      = 404
    response_page_path = "/404.html"
    error_caching_min_ttl = 300
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
        Action   = ["s3:GetObject", "s3:ListBucket"]
        Resource = ["${aws_s3_bucket.frontend.arn}/*", "${aws_s3_bucket.frontend.arn}"]
      }
    ]
  })
}

# CloudFront function for URL rewriting to handle Next.js static exports
resource "aws_cloudfront_function" "url_rewrite" {
  name    = "url-rewrite"
  runtime = "cloudfront-js-1.0"
  publish = true
  code    = <<-EOF
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  
  // Handle www redirect first if needed
  if (request.headers.host.value === 'stackmoji.com') {
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
        'location': { value: 'https://www.stackmoji.com' + uri + queryString },
        'cache-control': { value: 'max-age=3600' }
      }
    };
  }
  
  // Next.js static export path handling
  // If the URI doesn't end with a file extension (like .html, .js, .css, etc.)
  if (!uri.includes('.')) {
    // If URI doesn't end with a slash, check if we should serve the index.html in a subfolder
    if (uri.length > 0 && !uri.endsWith('/')) {
      // For paths like /privacy - check if we need to append /index.html
      request.uri = uri + '/index.html';
    } else if (uri.endsWith('/')) {
      // For paths with trailing slash like /privacy/ - serve the index.html file
      request.uri = uri + 'index.html';
    }
  }
  
  return request;
}
EOF
}
