# Get the hosted zone ID from the DNS account
data "aws_route53_zone" "domain" {
  provider = aws.dns
  name     = "stackmoji.com"
}

# Create ACM validation records
resource "aws_route53_record" "acm_validation" {
  provider = aws.dns
  for_each = {
    for dvo in aws_acm_certificate.frontend.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.domain.zone_id
}

# Wait for certificate validation
resource "aws_acm_certificate_validation" "frontend" {
  provider                = aws.us-east-1
  certificate_arn         = aws_acm_certificate.frontend.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]
}

# This A record will be created once CloudFront is ready
resource "aws_route53_record" "frontend_a" {
  provider = aws.dns
  zone_id  = data.aws_route53_zone.domain.zone_id
  name     = "stackmoji.com"
  type     = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

# AAAA record for IPv6
resource "aws_route53_record" "frontend_aaaa" {
  provider = aws.dns
  zone_id  = data.aws_route53_zone.domain.zone_id
  name     = "stackmoji.com"
  type     = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

# Add www subdomain records
resource "aws_route53_record" "www_a" {
  provider = aws.dns
  zone_id  = data.aws_route53_zone.domain.zone_id
  name     = "www.stackmoji.com"
  type     = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_aaaa" {
  provider = aws.dns
  zone_id  = data.aws_route53_zone.domain.zone_id
  name     = "www.stackmoji.com"
  type     = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
} 