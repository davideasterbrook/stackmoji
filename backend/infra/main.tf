terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  profile = "launchcraft-admin"
  region  = "eu-west-1"
}

provider "aws" {
  profile = "launchcraft-admin"
  region  = "us-east-1"
  alias   = "us-east-1"
}

# Provider for DNS account
provider "aws" {
  profile = "dns-launchcraft-admin"  # Update this to your DNS account profile
  region  = "us-east-1"  # Route 53 is global but uses us-east-1
  alias   = "dns"
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

# Random string for unique naming
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
} 