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

Most endpoints require authentication using JSON Web Tokens (JWT). All API routes are prefixed with `/api/v1`.

- **Register**: `POST /api/v1/auth/register`
- **Login**: `POST /api/v1/auth/login`

After logging in, include the `accessToken` in the `Authorization` header of your requests:

`Authorization: Bearer <your_access_token>`

## API Endpoints

### Auth (`/api/v1/auth`)

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
  "disabilityType": "VISUAL", // Optional: VISUAL, HEARING, PHYSICAL, COGNITIVE, SPEECH, OTHER
  "disabilityDetails": "Details...", // Optional
  "isVolunteer": false // Optional
}
```

**Login Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword"
}
```

---

### Users (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get all users (paginated) | Yes |
| GET | `/:id` | Get user by ID | Yes |
| POST | `/` | Create a new user (Admin) | Yes |
| PUT | `/:id` | Update user | Yes |
| DELETE | `/:id` | Delete user | Yes |

**Create/Update User Body:**
```json
{
  "email": "new@example.com",
  "phoneNumber": "0987654321",
  "firstName": "Jane",
  "lastName": "Smith",
  "username": "janesmith",
  "password": "newpassword",
  "isAdmin": false
}
```

---

### Volunteers (`/api/v1/volunteers`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create/Update your volunteer profile | Yes |
| GET | `/` | Get all volunteers | Yes |
| GET | `/:id` | Get volunteer profile by ID | Yes |
| PUT | `/:id` | Update volunteer profile (Owner) | Yes |

**Profile Body:**
```json
{
  "skills": ["Braille", "Sign Language", "First Aid"],
  "bio": "Experienced volunteer helper.",
  "isAvailable": true
}
```

---

### Service Requests (`/api/v1/service-requests`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create a new service request | Yes |
| GET | `/` | Get all service requests | Yes |
| GET | `/urgent` | Get urgent requests | Yes |
| GET | `/:id` | Get request by ID | Yes |
| PATCH | `/:id/accept` | Accept a request (Volunteer) | Yes |
| PATCH | `/:id/complete` | Mark request as completed | Yes |
| PATCH | `/:id/cancel` | Cancel request | Yes |

**Create Request Body:**
```json
{
  "title": "Need help with grocery shopping",
  "description": "I need someone to help me buy groceries from the store.",
  "isUrgent": true,
  "latitude": 30.0444,
  "longitude": 31.2357
}
```

---

### Appointments (`/api/v1/appointments`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create an appointment | Yes |
| GET | `/my` | Get my appointments | Yes |
| GET | `/:id` | Get appointment by ID | Yes |
| PATCH | `/:id/status`| Update status | Yes |

**Create Appointment Body:**
```json
{
  "title": "Weekly Guidance Session",
  "description": "Discussing accessible routes in the neighborhood.",
  "volunteerId": 5,
  "scheduledAt": "2024-03-01T10:00:00Z"
}
```

**Update Status Body:**
```json
{
  "status": "COMPLETED" // or "CANCELLED"
}
```

---

### Resources (`/api/v1/resources`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get all resources (searchable) | Yes |
| GET | `/:id` | Get resource by ID | Yes |
| POST | `/` | Create resource | Admin |
| PUT | `/:id` | Update resource | Admin |
| DELETE | `/:id` | Delete resource | Admin |

**Create/Update Resource Body:**
```json
{
  "title": "Accessible Park Map",
  "description": "Detailed map of parks with ramp access.",
  "url": "https://example.com/map",
  "category": "Mobility",
  "tags": ["Park", "Ramp", "Map"]
}
```

---

### Reviews (`/api/v1/reviews`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/` | Add a review for a volunteer | Yes |
| GET | `/volunteer/:id` | Get all reviews for a volunteer | Yes |

**Add Review Body:**
```json
{
  "rating": 5,
  "comment": "Very helpful and patient!",
  "volunteerId": 2,
  "serviceRequestId": 10, // Optional (provide either this or appointmentId)
  "appointmentId": null   // Optional
}
```

---

### Messages & WebSockets

#### Real-Time Chat Protocol
The app uses WebSockets for real-time communication between users and volunteers.

- **Connection URL**: `ws://localhost:3000/ws?token=<YOUR_JWT_TOKEN>`
- **Authentication**: The JWT token must be passed as a `token` query parameter.

**1. Sending a Message (Client to Server)**
Send a JSON string over the WebSocket connection:
```json
{
  "receiverId": 5,
  "content": "Hello! I am on my way to help.",
  "serviceRequestId": 12, // Optional
  "appointmentId": null   // Optional
}
```

**2. Receiving a Message (Server to Client)**
The server broadcasts new messages with a `type` field:
- **`NEW_MESSAGE`**: Received when someone sends you a message.
- **`MESSAGE_SENT`**: Received as an acknowledgment after you send a message.
- **`ERROR`**: Received if the message failed to process.

---

### Testing Real-Time Messaging

#### Option A: Using browser console (Quickest)
1. Login via the API and copy your `accessToken`.
2. Open your browser console (F12) on any page and paste this:
```javascript
const token = "YOUR_TOKEN_HERE";
const userId = 1; // ID of the user you want to message
const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

ws.onopen = () => {
    console.log("Connected!");
    ws.send(JSON.stringify({
        receiverId: userId,
        content: "Hello from the console!"
    }));
};

ws.onmessage = (event) => {
    console.log("Received:", JSON.parse(event.data));
};
```

#### Option B: Using Postman
1. Create a new **WebSocket Request**.
2. Set URL to `ws://localhost:3000/ws`.
3. Go to the **Params** tab and add `token` with your JWT.
4. Connect and send a JSON message in the message box.

---

### Emergency SOS (`/api/v1/sos`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/contacts` | Add emergency contact | Yes |
| GET | `/contacts` | List my emergency contacts | Yes |
| POST | `/alert` | Trigger SOS alert | Yes |
| GET | `/alerts` | List active SOS alerts | Yes |
| PATCH | `/alerts/:id/resolve` | Mark as resolved | Yes |

**Add Contact Body:**
```json
{
  "name": "Family Member",
  "phoneNumber": "+1234567890"
}
```

**Trigger SOS Body:**
```json
{
  "latitude": 30.0444,
  "longitude": 31.2357
}
```

---

### Accessible Places (`/api/v1/locations`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get all locations | No |
| GET | `/search` | Search locations by query | No |
| GET | `/:id` | Get location by ID | No |
| POST | `/` | Register new location | Yes |
| POST | `/:id/features` | Add accessibility feature | Yes |

**Add Location Body:**
```json
{
  "name": "Central Library",
  "address": "123 Library St, City",
  "latitude": 30.0500,
  "longitude": 31.2400
}
```

**Add Feature Body:**
```json
{
  "type": "Elevator",
  "description": "Spacious elevator on the ground floor.",
  "rating": 5
}
```

---

### Volunteer Badges (`/api/v1/badges`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | Get all available badges | No |
| GET | `/volunteer/:id` | Get badges earned by a volunteer | No |
| POST | `/` | Create a new badge | Admin |
| POST | `/award` | Manually award a badge | Admin |

**Create Badge Body:**
```json
{
  "name": "Top Helper",
  "description": "Awarded for 50 completed tasks.",
  "iconUrl": "https://example.com/icons/top-helper.png"
}
```

**Award Badge Body:**
```json
{
  "volunteerId": 5,
  "badgeId": 1
}
```
