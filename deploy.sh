#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
CDK_DIR="$ROOT_DIR/cdk"

echo "Building web app..."
npm run build

echo "Bootstrapping CDK (if needed)..."
cd "$CDK_DIR"
npx cdk bootstrap aws://183784642322/us-east-1 || true

echo "Synth + Deploy CDK stack..."
npm run build
npx cdk deploy gov-prod-demo --require-approval never

BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name gov-prod-demo --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name gov-prod-demo --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)

echo "Uploading artifacts to s3://$BUCKET_NAME ..."
aws s3 sync "$ROOT_DIR/dist" "s3://$BUCKET_NAME" --delete

echo "Creating CloudFront invalidation..."
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"

echo "Deployment complete: https://demo.telagri.com"


