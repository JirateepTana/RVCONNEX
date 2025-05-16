# RVCONNEX API Manager

## Installation and Setup

1. **Clone the repository:**

   ```sh
   git clone https://github.com/JirateepTana/RVCONNEX.git
   ```

2. **Navigate to the project folder and run docker Database**

   ```sh
    cd ./RVCONNEX
   ```

   ```sh
   docker compose up
   ```

3. **Navigate to the project folder:**

   ```sh
    cd ./RVCONNEX/api-manager
   ```

4. **Install dependencies:**

   ```sh
   npm install
   ```

5. **Run Project on localhost:3001**

   ```sh
    npm run dev
   ```

## API Documentation

### Authentication

- **Register:**  
  `POST /api/registerLogin`  
  Register a new user with a username and password.

- **Login:**  
  `PUT /api/registerLogin`  
  Log in with username and password to receive a JWT token.

### Task Management

- **Create Task:**  
  `POST /api/tasks`  
  Create a new task. Requires JWT token in the `Authorization` header.

- **Get Tasks:**  
  `GET /api/tasks`  
  Retrieve all tasks for the authenticated user.  
  Optional query parameters:

  - `title` (string): Filter tasks by title.

- **Update Task:**  
  `PUT /api/tasks`  
  Update an existing task by ID. Requires JWT token.

- **Delete Task:**  
  `DELETE /api/tasks`  
  Delete a task by ID. Requires JWT token.

### Request Headers

- `Authorization: Bearer <JWT_TOKEN_STRING>` (required for all /api/tasks endpoints)
- `Content-Type: application/json` (for POST, PUT, DELETE requests)

### Request/Response Examples

See the "Example Request/Response" section below for detailed payloads and responses.

---

**User Flow:**

1. Register a new user.
2. Log in to receive a JWT token (store in localStorage).
3. Use the token to create, view, update, or delete tasks.
4. Filter tasks by title or status using query parameters.
5. Only the user who created a task can update or delete it.

---

### Register/Login

**Login Request**

```http
PUT /api/registerLogin
Content-Type: application/json

{
  "username": "myuser",
  "password": "mypassword"
}
```

**Login Response**

```json
{
  "success": true,
  "token": "JWT_TOKEN_STRING",
  "message": "Login successful",
  "error": null
}
```

---

### Create Task

**Request**

```http
POST /api/tasks
Authorization: Bearer JWT_TOKEN_STRING
Content-Type: application/json

{
  "title": "My Task",
  "description": "This is a task",
  "status": "1"
}
```

**Response**

```json
{
  "success": true,
  "data": null,
  "message": "Task created",
  "error": null
}
```

---

### Get Tasks

**Request**

```http
GET /api/tasks
Authorization: Bearer JWT_TOKEN_STRING
```

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "My Task",
      "description": "This is a task",
      "status": "1",
      "updateuserby": 1
    }
  ],
  "message": null,
  "error": null
}
```

---

### Update Task

**Request**

```http
PUT /api/tasks
Authorization: Bearer JWT_TOKEN_STRING
Content-Type: application/json

{
  "id": 1,
  "title": "Updated Task",
  "description": "Updated description",
  "status": "2"
}
```

**Response**

```json
{
  "success": true,
  "data": {},
  "message": "Task updated",
  "error": null
}
```

---

### Delete Task

**Request**

```http
DELETE /api/tasks
Authorization: Bearer JWT_TOKEN_STRING
Content-Type: application/json

{
  "id": 1
}
```

**Response**

```json
{
  "success": true,
  "data": {},
  "message": "Task(s) deleted",
  "error": null
}
```

## Running Unit Tests

```sh
    cd ./RVCONNEX/api-manager
    npm test
```
