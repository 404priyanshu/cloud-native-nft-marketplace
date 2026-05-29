variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  default     = "staging"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "blockforge"
}

# ─── Networking ───
variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# ─── Database ───
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "blockforge"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "blockforge"
  sensitive   = true
}

# ─── Redis ───
variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t4g.micro"
}

# ─── ECS ───
variable "api_cpu" {
  description = "API task CPU units (1024 = 1 vCPU)"
  type        = number
  default     = 256
}

variable "api_memory" {
  description = "API task memory in MiB"
  type        = number
  default     = 512
}

variable "worker_cpu" {
  description = "Worker task CPU units"
  type        = number
  default     = 256
}

variable "worker_memory" {
  description = "Worker task memory in MiB"
  type        = number
  default     = 512
}

variable "api_desired_count" {
  description = "Number of API task replicas"
  type        = number
  default     = 1
}

# ─── Application ───
variable "api_port" {
  description = "API container port"
  type        = number
  default     = 3001
}

variable "domain_name" {
  description = "Domain name for ALB certificate (optional)"
  type        = string
  default     = ""
}

variable "rpc_url" {
  description = "Ethereum RPC URL for the worker"
  type        = string
  default     = ""
  sensitive   = true
}

variable "chain_id" {
  description = "Blockchain chain ID"
  type        = number
  default     = 11155111 # Sepolia
}

variable "nft_contract_address" {
  description = "Deployed NFT contract address"
  type        = string
  default     = ""
}

variable "marketplace_contract_address" {
  description = "Deployed Marketplace contract address"
  type        = string
  default     = ""
}
