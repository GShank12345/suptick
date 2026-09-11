set +e
LOG_FILE="supt-agent-image-2_$(date +%Y%m%d_%H%M%S).log"

# START Docker desktop if closed or stopped
if ! pgrep -x "Docker" > /dev/null; then
   echo "Docker is closed. Opening Docker."
   echo "Please wait."
   open -a Docker
   echo "Waiting for Docker to start."
    while ! docker system info > /dev/null 2>&1; do 
      sleep 2
    done
    echo "Docker is ready!"
else
    echo "Docker is already open. Leaving it running."
fi
docker run -d -p 8080:8080 "supt-agent-image-2:latest" 

sleep 5
echo "Invocation results are in the docker logs"
curl -X POST http://localhost:8080/invocations \  -H "Content-Type: application/json"  --max-time 20
echo -e
echo "Request sent \n"
CONTAINERS=$(docker ps -q --filter ancestor="supt-agent-image-2:latest")
echo "saving containers to a log file..."
docker logs "$CONTAINERS" > "$LOG_FILE" 2>&1
echo "Containers stopping and removing \n"
docker rm -f "$CONTAINERS"
echo "Container removed \n"

if [ "$WAS_DOCKER_CLOSED" = true ]; then
    echo "Closing Docker as it was opened by this script."
    osascript -e 'quit app "Docker"'
else
    echo "Leaving the Docker Desktop open as it was already running."
fi

echo "Workflow complete!"