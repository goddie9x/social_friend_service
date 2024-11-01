# Friend Service

The `friend_service` is a Node.js microservice responsible for managing friendships in a social media application. This service connects to MongoDB, registers with Eureka for service discovery, communicates with the `user_service` via gRPC, and uses Kafka for messaging.

To view all services for this social media system, lets visit: `https://github.com/goddie9x?tab=repositories&q=social`

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

## Setup

### 1. Clone the Repository

Clone the `friend_service` repository and navigate to the directory:

```bash
git clone https://github.com/goddie9x/social_friend_service.git
cd friend_service
```

### 2. Clone Utility Package

Clone the required `social_utils` package as a subdirectory in the project root:

```bash
git clone https://github.com/goddie9x/social_utils.git utils
```

### 3. Configuration

Create a `.env` file in the project root with the following environment variables:

```dotenv
APP_NAME=friend-service
PORT=3001
MONGODB_URI=mongodb://<username>:<password>@mongo:27017/friend  # Replace with actual MongoDB credentials
KAFKA_CLIENT_HOST=kafka:29092
APP_PATH=/api/v1/friends
IP_ADDRESS=friend-service
HOST_NAME=friend-service
USER_SERVICE_GRPC_ADDRESS=user-service:50051
```

These variables are essential for MongoDB, Kafka, Eureka, and gRPC configurations.

## Package Installation

Ensure all dependencies are installed by running:

```bash
npm install
```

## Running the Service Locally

To start the service locally:

```bash
npm start
```

The service will be available at `http://localhost:3001`.

## Running with Docker

1. **Dockerfile**:

   Create a `Dockerfile` in the project root with the following content:

   ```dockerfile
   FROM node:18-alpine
   WORKDIR /usr/src/app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 3001
   CMD ["npm", "start"]
   ```

2. **Build and Run the Docker Container**:

   Build and start the Docker container:

   ```bash
   docker build -t friend-service .
   docker run -p 3001:3001 --env-file .env friend-service
   ```

## Running with Docker Compose

To run `friend_service` within a Docker Compose setup, add the following configuration:

```yaml
friend-service:
  image: friend-service
  build:
    context: .
  ports:
    - 3001:3001
  environment:
    - APP_NAME=friend-service
    - PORT=3001
    - MONGODB_URI=mongodb://<username>:<password>@mongo:27017/friend  # Replace with actual MongoDB credentials
    - KAFKA_CLIENT_HOST=kafka:29092
    - APP_PATH=/api/v1/friends
    - IP_ADDRESS=friend-service
    - HOST_NAME=friend-service
    - USER_SERVICE_GRPC_ADDRESS=user-service:50051
  depends_on:
    - mongo
    - kafka
    - discovery-server
    - user-service
  networks:
    - social-media-network
```

Start all services with Docker Compose:

```bash
docker-compose up --build
```

## Accessing the Service

Once running, the `friend_service` will be available at `http://localhost:3001/api/v1/friends`.

---

This setup guide provides steps to configure, run, and deploy the `friend_service` for both local and Docker environments.

### Useful Commands

- **Stop Containers**: Use `docker-compose down` to stop all services and remove the containers.
- **Restart Containers**: Run `docker-compose restart` to restart the services without rebuilding the images.

This setup enables seamless orchestration of the social media microservices with an API Gateway for managing external client requests.

## Contributing

Contributions are welcome. Please clone this repository and submit a pull request with your changes. Ensure that your changes are well-tested and documented.

## License

This project is licensed under the MIT License. See `LICENSE` for more details.