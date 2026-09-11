# suptick

Project title :  Support Ticket Handler (STH) agent

Description: This project is about building an agent to help support team tackle high priority tickets in a professional setting.

Dependencies: npm, typescript, zod for defining the input schema inside the tool and retrieving the current date and contents of the bucket, strands sdk, , crypto.js - for encryption and decryption AWS Lambda - for key storage , ask-sdk for retriiving the bucket contents, express app for getting request and responses for the application invocation and health checks, steering tools in strands for prompt adherence.

Custom tools - supportTicTool, supportTicTool1

hooks via handler - [handler], contextual guardrails

build locally - npx tsc

run the script locally - One terminal - node dist/index.js
                       - Another terminal - curl -X POST http://localhost:8080/invocations \  -H "Content-Type: application/octet-stream"

Building the app in docker - docker build -t supt-agent-image-2:latest . 

Executing the script The script ./run_image_daily.sh first checks if the docker is closed or open. If closed it opens and sends a message 'waiting for the docker to open'. Once open, retrieves the JSON file from the mounted path (local file) and binds it to the docker path and runs the image inside the container and invokes the calls in the host 8080. The call invocations are sent to port is 8080. Once the data is transferred to the log file, the script runs commands to stop the container and then remove it.

Once installed run the script - ./run_image_daily.sh 

proper permissions to the script - chmod+x run_image_daily.sh
Use a cron job to schedule run at a particular time -------- 15 09 * * 1-5 /Users/gomathyshankaran/Downloads/strbedrck/run_image_daily.sh >> /Users/gomathyshankaran/Downloads/strbedrck/cronlogs/strbedrck.log 2>&1 - runs at 9:15 AM - Monday to Friday

Modifications Include environment variables for the Lambda function for the AWS key and Secret. API Function Call - Generate API trigger for the Lambda function and include it in your Javascript application using the 'https' url to fetch.

Authors

Gomathy S totsfun@yahoo.com License
