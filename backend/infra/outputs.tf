# ACM Certificate Validation Details
output "certificate_validation_records" {
  value = {
    for dvo in aws_acm_certificate.frontend.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  description = "The DNS records needed to validate the ACM certificate"
}

output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend.id
}

# CloudFront Distribution Domain Name
output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.frontend.id
} 