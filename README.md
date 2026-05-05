# RabbitStack

RabbitStack is a small containerized stack with:

- `frontend` - Next.js application
- `user-service` - NestJS HTTP entrypoint
- `vehicle-service` - NestJS RabbitMQ microservice
- `rabbitmq` - message broker used for inter-service communication

The `user-service` exposes HTTP endpoints and communicates with `vehicle-service` through RabbitMQ.

## Project Structure

- `frontend/` - Next.js frontend
- `user-service/` - main backend HTTP service
- `vehicle-service/` - backend microservice connected through RabbitMQ
- `docker-compose.yml` - production-style stack
- `docker-compose.dev.yml` - development stack with hot reload

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
- User service: `http://localhost:3001`
- RabbitMQ management UI: `http://localhost:15672`

### Example Endpoints

- `GET /` on `user-service`: `http://localhost:3001/`
- `GET /vehicles/hello` on `user-service`: `http://localhost:3001/vehicles/hello`

The `/vehicles/hello` endpoint sends a RabbitMQ message from `user-service` to `vehicle-service`.

## Production Mode

Use the main compose file for a production-style containerized run.

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

- `frontend` is built as a standalone Next.js app for a smaller runtime container.
- `vehicle-service` does not expose an HTTP port. It runs only as a RabbitMQ microservice.
- `user-service` is the public backend entrypoint inside this stack.
- For AWS EC2 deployment, you typically run this compose stack on a single VM with multiple containers.

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
