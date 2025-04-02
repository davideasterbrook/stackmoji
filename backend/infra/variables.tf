variable "project_name" {
  type    = string
  default = "stackmoji"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type    = string
  default = "eu-west-1"
}

variable "allowed_origins" {
  type    = list(string)
  default = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://emoji-shadow.vercel.app",
  ]
  description = "List of allowed CORS origins"
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
  default     = "dev"
} 