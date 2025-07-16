#!/bin/bash
set -e

IMAGE=dropdown-list-badge-test
CONTAINER_NAME=dropdown-list-badge-server
UPDATE_SNAPSHOTS=""
SHOW_HELP=0

for arg in "$@"; do
  case $arg in
    --update-snapshots)
      UPDATE_SNAPSHOTS="--update-snapshots"
      shift
      ;;
    --help|-h)
      SHOW_HELP=1
      shift
      ;;
  esac
done

if [ "$SHOW_HELP" -eq 1 ]; then
  echo "Usage: $0 [--update-snapshots] [--help]"
  echo ""
  echo "Options:"
  echo "  --update-snapshots   Update Playwright visual regression snapshots"
  echo "  --help, -h           Show this help message"
  exit 0
fi

echo "Cleaning up any previous test containers..."
docker ps -a --filter "name=dropdown-list-badge" --format "{{.ID}}" | xargs -r docker rm -f

echo "Building Docker image..."
docker build -t $IMAGE .

# Ensure test artifact directories exist and are writable
mkdir -p tests/test-results
chmod -R 777 tests/test-results
mkdir -p tests/html-report
chmod -R 777 tests/html-report
mkdir -p tests/__snapshots__
chmod -R 777 tests/__snapshots__

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

set +e

echo "Running Playwright tests..."
docker run --rm --network host \
  -v "$(pwd)/tests:/app/tests" \
  -v "$(pwd)/tests/__snapshots__:/app/tests/__snapshots__" \
  -v "$(pwd)/tests/test-results:/app/tests/test-results" \
  -v "$(pwd)/tests/html-report:/app/tests/html-report" \
  -e NPM_CONFIG_OMIT=optional \
  $IMAGE npx playwright test --config=tests/playwright.config.ts $UPDATE_SNAPSHOTS

echo "Stopping server container..."
docker rm -f $CONTAINER_NAME

echo "Done."
