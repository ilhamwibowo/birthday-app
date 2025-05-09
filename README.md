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
* We assume the worker will not fail or late. Finding users who have birthday is using a stale clock at the start of the function. If iterating through timezones takes longer than 15 minutes, it will still send happy birthdays to users albeit late. We do not handle worker errors and/or logging mechanism.

### Limitations:
* Notifications are currently only logged (no actual email/SMS integration)
* The birthday worker runs every 15 minutes to check for birthdays
* Rate limiting is implemented (100 requests per 15 minutes)
* Maximum retry mechanism is 3 retries, we move on after 3 failures as we do not implement tracking mechanism to the message sending
* Send birthday message mechanism is being simulated with 50 percent chance (random) of failure

### Design Decisions:
* Layered architecture (Controllers, Services, Repositories, Models)
* Global error handler with consistent error responses
* Asynchronous operations wrapped with asyncHandler utility
* Joi for request validation


## Extra Notes
1. As per the feedback, running the worker for every hour might miss some timezones. Therefore I modified it into every 15 minutes. This decision is not random as I found in multiple sources e.g. https://en.wikipedia.org/wiki/UTC_offset, https://www.timeanddate.com/time/time-zones-interesting.html. It was stated that smallest granularity of time difference is 15 minutes. There could be places with 30 minutes difference, or 45 minutes difference. Either way, it should be a multiple of 15 minutes. This raises another issue in which we need to handle possible duplicate messages sent to the same user.
2. Query-ing the whole database for every hour is indeed inefficient. To make things worse, we plan to make the interval smaller to 15 minutes. There are multiple ways that we can approach this issue:
- We can use a pipeline and leave the whole work to the database. The pipeline will include a calculation of each user's birthday according to their timezone and we take out ones that match. But I think this is tedious and not maintainable.
- We can use a 'window' to pre-filter the users before determining which users have birthday. And example of such window is we filter today (UTC) +- 1 day to include 1 day difference. Then we can filter out birthdays of those subset of users. Though, I think this method is too crude and untested therefore I deem it unreliable.
- We use some sort of queueing or caching mechanism, but this is out of requirement.
- We take out distinct timezones, and for every timezone we run a query to find the user. Before we run the query, we could add a check if its 9 AM in that timezone. If it is, then we get the users who are having birthday. I believe this solution is the optimal solution in terms of maintainability and performance. While there could potentially be multiple queries because of this, it's negligible as there could only be so many timezones. 
3. Because we run the worker every 15 minutes, if we only compare the hour (9 AM) the worker will send multiple 'Happy Birthday'(s) to the same user. I believe the solution to this is adding another check by the minute. Therefore, we should not only check which users have birthdays at precicely 9 AM, but 9.00 AM - 9.14 AM.
4. This is a limitation to the system, if the worker runs late, it wil miss an entirety of users. We could solve this by adding a flag to user model or add a comprehensive log. But I think that's out of the requirement therefore I will leave it as a limitation.