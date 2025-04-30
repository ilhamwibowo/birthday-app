# Birthday App

A simple application to manage user birthdays and send notifications at 9 AM in each user's local timezone.

## Setup and Installation

This project can be run using Docker and Docker Compose.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/ilhamwibowo/birthday-app
    cd birthday-app
    ```

2.  **Create a `.env` file:**

    Copy the example environment file and update the values.

    ```bash
    cp .env.example .env
    ```

3.  **Build and run the Docker containers:**

    ```bash
    docker-compose up --build
    ```

    This will build the Docker images for the application and the worker, and then start the containers. The application will be accessible at `http://localhost:<PORT>` (replace `<PORT>` with the port defined in your `.env` file, default is 3000).

## API Endpoints

The application provides the following API endpoints for managing users:

### Create a new user

`POST /api/users`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "birthday": "1990-05-15",
  "timezone" : "America/New_York"
}
```

**Response:**

```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "birthday": "1990-05-15T00:00:00.000Z",
  "timezone": "America/New_York"
}
```

### Get all users

`GET /api/users`

**Response:**

```json
[
  {
    "_id": "...",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "birthday": "1990-05-15T00:00:00.000Z",
    "timezone": "America/New_York"
  },
  {
    "_id": "...",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "birthday": "1992-11-20T00:00:00.000Z",
    "timezone": "America/New_York"
  }
]
```

### Get a user by ID

`GET /api/users/:id`

**Response:**

```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "birthday": "1990-05-15T00:00:00.000Z",
  "timezone": "America/New_York"
}
```

### Update a user by ID

`PUT /api/users/:id`

**Request Body:**

```json
{
  "name": "Johnathan Doe"
}
```

**Response:**

```json
{
  "_id": "...",
  "name": "Johnathan Doe",
  "email": "john.doe@example.com",
  "birthday": "1990-05-15T00:00:00.000Z",
  "timezone": "America/New_York"
}
```

### Delete a user by ID

`DELETE /api/users/:id`

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

## Assumptions, Limitations, and Design Decisions

### Assumptions:
* MongoDB is used as the database and must be accessible via the configured MONGO_URI
* Birthday notifications are sent at 9 AM in the user's local timezone
* Timezones must be valid (e.g., "America/New_York")
* Birthdays must be in the past (future dates are rejected)
* Email addresses must be unique in the system

### Limitations:
* Notifications are currently only logged (no actual email/SMS integration)
* The birthday worker runs every hour to check for birthdays
* Rate limiting is implemented (100 requests per 15 minutes)

### Design Decisions:
* Layered architecture (Controllers, Services, Repositories, Models)
* Global error handler with consistent error responses
* Asynchronous operations wrapped with asyncHandler utility
* Joi for request validation
