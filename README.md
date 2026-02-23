# Disabilities App Backend

This is a backend service built with [Bun](https://bun.sh) and [Express](https://expressjs.com) to assist people with disabilities and connect them with volunteers. It uses [Prisma](https://www.prisma.io) with PostgreSQL for data management.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/docs/installation) installed.
- PostgreSQL database running.

### Installation

```bash
bun install
```

### Configuration

Create a `.env` file in the root directory and add your database URL and JWT secret:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/disabilities_db?schema=public"
JWT_SECRET="your_super_secret_key"
```

### Running the App

```bash
# Development mode
bun run index.ts
```

## Authentication

Most endpoints require authentication using JSON Web Tokens (JWT). 

- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`

After logging in, include the `accessToken` in the `Authorization` header of your requests:

`Authorization: Bearer <your_access_token>`

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register a new user/volunteer | No |
| POST | `/login` | Login and get access token | No |

**Register Body:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "password": "securepassword",
  "disabilityType": "VISUAL", // Optional (VISUAL, HEARING, PHYSICAL, COGNITIVE, SPEECH, OTHER)
  "disabilityDetails": "Details here...", // Optional
  "isVolunteer": false // Optional, default: false
}
```

---

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get all users (paginated) | Yes |
| GET | `/:id` | Get user by ID | Yes |
| POST | `/` | Create a new user (Admin) | Yes |
| PUT | `/:id` | Update user | Yes |
| DELETE | `/:id` | Delete user | Yes |

---

### Volunteers (`/api/volunteers`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create/Update your volunteer profile | Yes |
| GET | `/` | Get all volunteers | Yes |
| GET | `/:id` | Get volunteer profile by ID | Yes |
| PUT | `/:id` | Update volunteer profile (Owner) | Yes |

**Volunteer Profile Body:**
```json
{
  "skills": ["Braille", "Sign Language"],
  "bio": "I am happy to help...",
  "isAvailable": true
}
```

---

### Service Requests (`/api/service-requests`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create a new service request | Yes |
| GET | `/` | Get all service requests | Yes |
| GET | `/:id` | Get request by ID | Yes |
| PATCH | `/:id/accept` | Accept a request (Volunteer) | Yes |
| PATCH | `/:id/complete` | Mark request as completed | Yes |
| PATCH | `/:id/cancel` | Cancel request | Yes |

---

### Appointments (`/api/appointments`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create an appointment | Yes |
| GET | `/my` | Get my appointments | Yes |
| GET | `/:id` | Get appointment by ID | Yes |
| PATCH | `/:id/status`| Update status (CANCELLED/COMPLETED) | Yes |

---

### Resources (`/api/resources`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get all resources | Yes |
| GET | `/:id` | Get resource by ID | Yes |
| POST | `/` | Create resource | Admin |
| PUT | `/:id` | Update resource | Admin |
| DELETE | `/:id` | Delete resource | Admin |
