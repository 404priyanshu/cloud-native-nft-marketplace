# ─── ECS Cluster ───
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ─── CloudWatch Log Groups ───
resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.project_name}-${var.environment}/api"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/ecs/${var.project_name}-${var.environment}/worker"
  retention_in_days = 30
}

# ─── Locals ───
locals {
  database_url = "postgresql://${var.db_username}:${random_password.db.result}@${aws_db_instance.main.endpoint}/${var.db_name}?schema=public"
  redis_url    = "redis://${aws_elasticache_cluster.main.cache_nodes[0].address}:6379"
}

# ─── API Task Definition ───
resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project_name}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "api"
    image     = "${aws_ecr_repository.api.repository_url}:latest"
    essential = true

    portMappings = [{
      containerPort = var.api_port
      protocol      = "tcp"
    }]

    environment = [
      { name = "PORT", value = tostring(var.api_port) },
      { name = "DATABASE_URL", value = local.database_url },
      { name = "REDIS_URL", value = local.redis_url },
      { name = "CORS_ORIGIN", value = "*" },
      { name = "JWT_EXPIRES_IN_SECONDS", value = "3600" },
      { name = "AUTH_NONCE_TTL_SECONDS", value = "300" },
      { name = "S3_BUCKET", value = aws_s3_bucket.assets.id },
      { name = "AWS_REGION", value = var.aws_region },
      { name = "UPLOAD_URL_TTL_SECONDS", value = "300" },
      { name = "NODE_ENV", value = "production" },
    ]

    secrets = [
      {
        name      = "JWT_SECRET"
        valueFrom = aws_secretsmanager_secret.jwt_secret.arn
      },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.api.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "api"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "wget --no-verbose --spider http://localhost:${var.api_port}/health || exit 1"]
      interval    = 15
      timeout     = 5
      retries     = 3
      startPeriod = 30
    }
  }])
}

# ─── Worker Task Definition ───
resource "aws_ecs_task_definition" "worker" {
  family                   = "${var.project_name}-worker"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.worker_cpu
  memory                   = var.worker_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "worker"
    image     = "${aws_ecr_repository.worker.repository_url}:latest"
    essential = true

    environment = [
      { name = "DATABASE_URL", value = local.database_url },
      { name = "REDIS_URL", value = local.redis_url },
      { name = "RPC_URL", value = var.rpc_url },
      { name = "CHAIN_ID", value = tostring(var.chain_id) },
      { name = "NETWORK_NAME", value = var.environment },
      { name = "NFT_CONTRACT_ADDRESS", value = var.nft_contract_address },
      { name = "MARKETPLACE_CONTRACT_ADDRESS", value = var.marketplace_contract_address },
      { name = "INDEXER_START_BLOCK", value = "0" },
      { name = "INDEXER_BLOCK_RANGE", value = "1000" },
      { name = "INDEXER_POLL_INTERVAL_MS", value = "5000" },
      { name = "INDEXER_LOCK_TTL_MS", value = "30000" },
      { name = "NODE_ENV", value = "production" },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.worker.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "worker"
      }
    }
  }])
}

# ─── API Service ───
resource "aws_ecs_service" "api" {
  name            = "${var.project_name}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = var.api_port
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  depends_on = [aws_lb_listener.http]
}

# ─── Worker Service ───
resource "aws_ecs_service" "worker" {
  name            = "${var.project_name}-worker"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.worker.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }
}
