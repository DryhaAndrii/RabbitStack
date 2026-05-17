# RabbitStack

RabbitStack is a small containerized stack with:

- `nginx` - reverse proxy and public entrypoint
- `frontend` - Next.js application
- `auth-service` - NestJS HTTP entrypoint for the platform
- `user-service` - NestJS microservice for user domain logic
- `vehicle-service` - NestJS RabbitMQ microservice
- `rabbitmq` - message broker used for inter-service communication
- `postgres` - shared database used by backend services
- `redis` - session store container reserved for future Redis-based auth

The `auth-service` is now the HTTP entrypoint. The `user-service` and `vehicle-service` run as RabbitMQ microservices behind it. A Redis container is also started with the stack so Redis-backed session auth can be added later without changing the deployment shape.

## Project Structure

- `frontend/` - Next.js frontend
- `auth-service/` - main backend HTTP entry service
- `user-service/` - backend microservice for user-related logic
- `vehicle-service/` - backend microservice connected through RabbitMQ
- `nginx/` - reverse proxy configuration
- `docker-compose.yml` - production-style stack
- `docker-compose.dev.yml` - development stack with hot reload
- `redis` is included in both compose files with a `256m` container memory limit

## Development Mode

Use the development compose file to run the full project with live reload.

### Start

```bash
docker compose -f docker-compose.dev.yml up
```

Run in detached mode:

```bash
docker compose -f docker-compose.dev.yml up -d
```

### Stop

```bash
docker compose -f docker-compose.dev.yml down
```

To remove the development volumes too:

```bash
docker compose -f docker-compose.dev.yml down -v
```

### Available Services

- Frontend: `http://localhost:3000`
- Auth service: `http://localhost:3001`
- RabbitMQ management UI: `http://localhost:15672`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### Example Endpoint

- `GET /` on `auth-service`: `http://localhost:3001/`

## Production Mode

Use the main compose file for a production-style containerized run.

In production mode, `nginx` is the single public entrypoint:

- `/` -> `frontend`
- `/api/*` -> `auth-service`

### Start

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up -d --build
```

### Stop

```bash
docker compose down
```

### Notes

- Public app URL: `http://localhost`
- Public API example: `http://localhost/api/`
- `frontend` is built as a standalone Next.js app for a smaller runtime container.
- `user-service` and `vehicle-service` do not expose public HTTP ports. They run as RabbitMQ microservices.
- `auth-service` is the public backend entrypoint inside this stack.
- `nginx` forwards `/` to the frontend container and `/api/*` to the auth-service container.
- `postgres` is started together with the backend microservices and is shared by `user-service` and `vehicle-service`.
- `redis` is started together with the rest of the stack and is limited to `256m` of container memory.
- For AWS EC2 deployment, you typically run this compose stack on a single VM with multiple containers. The existing deploy workflow uses `sudo docker compose up -d --build`, so the new Redis container will be created automatically on the EC2 host after deploy.

## Useful Commands

View logs:

```bash
docker compose logs -f
```

Development logs:

```bash
docker compose -f docker-compose.dev.yml logs -f
```

Rebuild production containers:

```bash
docker compose build
```
