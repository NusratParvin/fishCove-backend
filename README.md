# Bike Rental Service

Welcome to the Bike Rental Reservation System! This project is designed to manage bike rentals in Cox's Bazar, catering to both tourists and locals with a seamless online booking experience. The backend system handles user registrations, bike availability, and booking management efficiently.

## Live URL

```sh
https://bike-rental-service-serverside.vercel.app/
```

## Features

- **User Registration and Login**: Secure user authentication with JWT.
- **Profile Management**: Update user profiles with validation.
- **Bike Management (Admin Only)**: Create, update, and delete bike listings.
- **Bike Rental**: Rent bikes, update rental status, and calculate total cost based on rental duration.
- **Rental Management**: View all rentals and manage rental returns.

## Technology Stack

- **Programming Language**: TypeScript
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod
- **Authentication**: JWT (JSON Web Token)

## Setup and Installation

### Clone the Repository

1. **Clone the repository:**

```sh
git clone https://github.com/NusratParvin/Bike-Rental-Service
cd bike-rental-service
```

2. **Install dependencies:**

   ```
   npm install
   ```

## Usage

1. **Start the application:**

   ```
   npm run start:dev
   ```

   The application should now be running on `http://localhost:5000`.

2. **Access the API:**

   You can use a tool like [Postman](https://www.postman.com/) to test the API endpoints.

## API Endpoints

### User Routes

**Sign Up**

- **Endpoint:** `/api/auth/signup`
- **Method:** `POST`
- **Request Body:**

  ```

  {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "address": "123 Main St, Anytown",
  "role": "admin"
  }
  ```

``

- **Response :**
  ```
  {
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
  "_id": "60d9c4e4f3b4b544b8b8d1f5",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "123 Main St, Anytown",
  "role": "admin",
  "createdAt": "2024-06-10T13:26:51.289Z",
  "updatedAt": "2024-06-10T13:26:51.289Z",
  "__v": 0
  }
  }
  ``
  ```

**User Login**

- **Endpoint:** `/api/auth/login`
- **Method:** `POST`
- **Request Body:**

  ```

  {
  "email": "john@example.com",
  "password": "password123"
  }
  ```

- **Response :**

```

{
"success": true,
"statusCode": 200,
"message": "User logged in successfully",
"token": "jwt_token",
"data": {
"\_id": "60d9c4e4f3b4b544b8b8d1c3",
"name": "John Doe",
"email": "john@example.com",
"phone": "1234567890",
"address": "123 Main St, Anytown",
"role": "admin"
}
}

``

```

**Get Profile**

- **Endpoint:** `/api/users/me`
- **Method:** `GET`
- **Request Headers:** `Authorization: Bearer jwt_token`:

- **Response :**

  ```
  {
  "success": true,
  "statusCode": 200,
  "message": "User profile retrieved successfully",
  "data": {
  "_id": "6666ff917181b8e5ffe04f91",
  "name": "admin",
  "email": "admin@gmail.com",
  "phone": "1234567890",
  "address": "123 Main St, Anytown",
  "role": "admin",
  "createdAt": "2024-06-10T13:28:49.260Z",
  "updatedAt": "2024-06-10T13:28:49.260Z",
  "__v": 0
  }
  }
  ```

**Update Profile**

- **Endpoint:** `/api/users/me`
- **Method:** `PUT`
- **Request Headers:** `Authorization: Bearer jwt_token`

- **Request Body :**

```

{
"name": "John Updated",
"phone": "0987654321"
}

```

- **Response :**

```

{
"success": true,
"statusCode": 200,
"message": "Profile updated successfully",
"data": {
"\_id": "60d9c4e4f3b4b544b8b8d1c5",
"name": "John Updated",
"email": "john@example.com",
"phone": "0987654321",
"address": "123 Main St, Anytown",
"role": "admin"
}
}

``
```

### Bike Routes

- **Create Bike (Admin Only)**

  - **Endpoint:** `/api/bikes`
  - **Method:** `POST`
  - **Request Headers:** `Authorization: Bearer jwt_token`

  - **Request Body:**

    ```
    {
    "name": "Mountain Bike",
    "description": "A durable mountain bike for rough terrains.",
    "pricePerHour": 15,
    "cc": 250,
    "year": 2022,
    "model": "X1",
    "brand": "Yamaha"
    }
    ```

  - **Response:**

  ```

  {

  "success": true,
  "statusCode": 200,
  "message": "Bike added successfully",
  "data": {
  "\_id": "60d9c4e4f3b4b544b8b8d1c4",
  "name": "Mountain Bike",
  "description": "A durable mountain bike for rough terrains.",
  "pricePerHour": 15,
  "isAvailable": true,
  "cc": 250,
  "year": 2022,
  "model": "X1",
  "brand": "Yamaha"
  }
  }

  ```

- **Get All Bikes**

  - **Endpoint:** `/api/bikes`
  - **Method:** `GET`
  - **Response:**

    ```
    {
    "success": true,
    "statusCode": 200,
    "message": "Bikes retrieved successfully",
    "data": [
    {
    "_id": "bike_id",
    "name": "Mountain Bike",
    "description": "A durable mountain bike for rough terrains.",
    "pricePerHour": 15,
    "isAvailable": true,
    "cc": 250,
    "year": 2022,
    "model": "X1",
    "brand": "Yamaha"
    },
    ...other bikes...
    ]
    }
    ```

- **Update Bike (Admin Only)**

  - **Endpoint:** `/api/bikes/:id`
  - **Method:** `PUT`
  - **Request Headers:** `Authorization: Bearer jwt_token`
  - **Request Body:**

  ```

    {
    "pricePerHour": 20
    }
  ```

  - **Response:**

  ```
  {

  "success": true,
  "statusCode": 200,
  "message": "Bike updated successfully",
  "data": {
  "_id": "bike_id",
  "name": "Mountain Bike",
  "description": "A durable mountain bike for rough terrains.",
  "pricePerHour": 20,
  "isAvailable": true,
  "cc": 250,
  "year": 2022,
  "model": "X1",
  "brand": "Yamaha"
  }
  }
  ```

- **Delete Bike (Admin Only)**

  - **Endpoint:** `/api/bikes/:id`
  - **Method:** `DELETE`
  - **Request Headers:** `Authorization: Bearer jwt_token`
  - **Response:**

    ```
    {

    "success": true,
    "statusCode": 200,
    "message": "Bike deleted successfully",
    "data": {
    "_id": "bike_id",
    "name": "Mountain Bike",
    "description": "A durable mountain bike for rough terrains.",
    "pricePerHour": 20,
    "isAvailable": false,
    "cc": 250,
    "year": 2022,
    "model": "X1",
    "brand": "Yamaha"
    }
    }
    ```

### Rental Routes

- **Create Rental**

  - **Endpoint:** `/api/rentals`
  - **Method:** `POST`
  - **Request Headers:** `Authorization: Bearer jwt_token`
  - **Request Body:**

    ```

    {
    "bikeId": "60d9c4e4f3b4b544b8b8d1c4",
    "startTime": "2024-06-10T09:00:00Z"
    }
    ```

  - **Response:**

    ```
    {

    "success": true,
    "statusCode": 200,
    "message": "Rental created successfully",
    "data": {
    "_id": "60d9c4e4f3b4b544b8b8d1c4",
    "userId": "60d9c4e4f3b4b544b8b8d1c3",
    "bikeId": "60d9c4e4f3b4b544b8b8d1c4",
    "startTime": "2024-06-10T09:00:00Z",
    "returnTime": null,
    "totalCost": 0,
    "isReturned": false
    }
    }
    ``
    ```

- **Return Bike (Admin only)**

  - **Endpoint:** `/api/bikes`
  - **Method:** `PUT`
  - **Request Headers:** `Authorization: Bearer jwt_token`
  - **Response:**

  ```

  {
  "success": true,
  "statusCode": 200,
  "message": "Bike returned successfully",
  "data": {
  "_id": "60d9c4e4f3b4b544b8b8d1c4",
  "userId": "60d9c4e4f3b4b544b8b8d1c3",
  "bikeId": "60d9c4e4f3b4b544b8b8d1c4",
  "startTime": "2024-06-10T09:00:00Z",
  "returnTime": "2024-06-10T18:00:00Z",
  "totalCost": 135,
  "isReturned": true
  }
  }
  ``

  ```

- **Get All Rentals for User (My rentals)**

  - **Endpoint:** `/api/rentals`
  - **Method:** `GET`
  - **Request Headers:** `Authorization: Bearer jwt_token`
  - **Response:**

    ```
    {

    "success": true,
    "statusCode": 200,
    "message": "Rentals retrieved successfully",
    "data": [
    {
    "_id": "60d9c4e4f3b4b544b8b8d1c4",
    "userId": "60d9c4e4f3b4b544b8b8d1c3",
    "bikeId": "60d9c4e4f3b4b544b8b8d1c4",
    "startTime": "2024-06-10T09:00:00Z",
    "returnTime": "2024-06-10T18:00:00Z",
    "totalCost": 135,
    "isReturned": true
    },
    ...other rentals...
    ]
    }
    ``
    ```

## Error Handling

Validation errors from Zod are handled explicitly in the controllers, and other errors are passed to the error handling middleware.

- **Validation Errors:**

  - If validation fails, a 400 status code is returned with a detailed error message.

- **Not Found Errors:**

  - Unmatched routes return a 400 status code with a "Route not found" message.

- **General Errors:**

  - A 400 status code is returned for any unhandled errors, with a generic error message.

- **Error Response Object:**

  ```

  {
  "success": false,
  "message": "Error Type (e.g., Validation Error, Cast Error, Duplicate Entry)",
  "errorMessages": [
  {
  "path": "",
  "message": "Error message"
  }
  ],
  "stack": "error stack"
  }

  ``

  ```

- **Authentication Middleware:**

  ```

  {
  "success": false,
  "statusCode": 401,
  "message": "You have no access to this route"
  }

  ```
"# fishCove-backend" 
