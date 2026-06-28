---
slug: aws-production-deployment
title: AWS production deployment plan
category: System Design
severity: Low
tags:
  - aws
  - production
  - deployment
  - scaling
customer_phrases:
  - how would this deploy to aws
  - production architecture
  - how would this scale
---
# AWS production deployment plan

![AWS production deployment](/docs/diagrams/aws-production.svg)

## Summary

The current take-home is deployed on Vercel and Neon for speed. In production on AWS, the same app can be containerized and deployed behind CloudFront, WAF, an ALB, ECS Fargate, RDS Postgres, Secrets Manager, and CloudWatch.

## Proposed AWS architecture

- Route 53 manages DNS.
- CloudFront handles TLS, caching, and edge delivery.
- AWS WAF applies request filtering and rate limiting.
- Application Load Balancer routes traffic to the Next.js service.
- ECS Fargate runs the containerized Next.js app.
- RDS Postgres stores customer, vehicle, subscription, billing, lane, audit, and docs data.
- pgvector in RDS supports semantic support-doc retrieval.
- Secrets Manager stores database URLs, payment-provider keys, and third-party credentials.
- CloudWatch captures logs, metrics, dashboards, and alarms.
- GitHub Actions builds, tests, pushes images to ECR, and deploys to ECS.

## Production controls to add

- Auth and RBAC for CSR, manager, admin, and read-only roles.
- Payment provider integration with webhooks, decline codes, refunds, retries, proration, and idempotency keys.
- Real lane/kiosk/plate-reader event ingestion.
- Queue/worker processing for billing retry and subscription state transitions.
- Database connection pooling.
- Multi-AZ Postgres, backups, point-in-time recovery, and read replicas if reporting load grows.
- Structured audit logs and retention policies.
- Observability for route latency, failed actions, search errors, blocked-lane volume, and payment recovery rate.

## Deployment pipeline

1. Developer pushes to GitHub.
2. GitHub Actions runs lint, tests, build, and Prisma validation.
3. Docker image is built and pushed to ECR.
4. ECS service is updated with the new image.
5. Health checks verify the deployment.
6. CloudWatch alarms watch error rate and latency.
7. Rollback uses the previous ECS task definition.
