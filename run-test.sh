#!/bin/bash
set -e

IMAGE=dropdown-list-badge-test
CONTAINER_NAME=dropdown-list-badge-server

echo "Cleaning up any previous test containers..."
docker ps -a --filter "name=dropdown-list-badge" --format "{{.ID}}" | xargs -r docker rm -f

echo "Building Docker image..."
docker build -t $IMAGE .

echo "Starting server container..."
docker rm -f $CONTAINER_NAME 2>/dev/null || true
docker run --name $CONTAINER_NAME -d -p 5000:5000 $IMAGE npx serve -l 5000 .

echo "Waiting for server to be ready..."
for i in {1..20}; do
  if curl -s http://localhost:5000/test/index.html >/dev/null; then
    echo "Server is up!"
    break
  fi
  sleep 1
done

echo "Running Playwright tests..."
docker run --rm --network host \
  -v "$(pwd)/tests:/app/tests" \
  -v "$(pwd)/tests/__snapshots__:/app/tests/__snapshots__" \
  -v "$(pwd)/tests/results:/app/tests/results" \
  $IMAGE npx playwright test --output=tests/results
  
echo "Stopping server container..."
docker rm -f $CONTAINER_NAME

echo "Done."
