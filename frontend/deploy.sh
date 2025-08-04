#!/bin/bash
set -e
export AWS_PROFILE=launchcraft-admin

# Get the bucket name and distribution ID from terraform output
BUCKET_NAME=$(cd ../backend/infra && terraform output -raw frontend_bucket_name)
DISTRIBUTION_ID=$(cd ../backend/infra && terraform output -raw cloudfront_distribution_id)

# Download latest files from production
echo "Downloading latest game data and font from stackmoji.com..."
curl -f -L -o public/stackmoji-game-data.json https://www.stackmoji.com/stackmoji-game-data.json || echo "Warning: Failed to download game data, using local copy"
curl -f -L -o public/NotoColorEmoji-Stackmoji-Subset.ttf https://www.stackmoji.com/NotoColorEmoji-Stackmoji-Subset.ttf || echo "Warning: Failed to download font, using local copy"

# Build the Next.js app
echo "Building Next.js application..."
npm install
npm run build

# Sync with S3
echo "Syncing with S3..."
aws s3 sync out/ s3://$BUCKET_NAME --delete

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
AWS_PAGER="" aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "Deployment complete at $(date '+%Y-%m-%d %H:%M:%S')!"