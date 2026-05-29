output "alb_dns_name" {
  description = "ALB DNS name (API endpoint)"
  value       = aws_lb.api.dns_name
}

output "ecr_api_url" {
  description = "ECR repository URL for API image"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_worker_url" {
  description = "ECR repository URL for Worker image"
  value       = aws_ecr_repository.worker.repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = "${aws_elasticache_cluster.main.cache_nodes[0].address}:6379"
}

output "s3_bucket_name" {
  description = "S3 bucket for NFT assets"
  value       = aws_s3_bucket.assets.id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}
