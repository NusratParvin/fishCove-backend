# FishCove: Fish Care Tips & Stories

Welcome to **FishCove**, a platform dedicated to offering expert tips and advice on fish care. Whether you're a beginner or an experienced fish owner, FishCove provides detailed guides, engaging stories, and premium content to help you maintain a healthy and happy aquatic life for your pets.

## Features

- **User Registration and Login**: Secure user authentication using JWT tokens, allowing users to register, log in, and access exclusive content.
- **Profile Management**: Users can update their profiles, including profile pictures, personal information, and view their articles, followers, and following lists.
- **Fish Care Articles**: Users can browse tips and stories about fish care, including nutrition, tank maintenance, and more.
- **Premium Content**: Premium articles are available for users who have made payments, providing access to exclusive content on fish care.
- **Article Creation & Management**: Users can write, edit, and delete their fish care tips and stories. Articles can be categorized as either "Tip" or "Story."
- **Upvote & Downvote System**: Users can upvote or downvote articles, providing feedback and helping others discover the most valuable content.
- **Commenting System**: Users can comment on articles, reply to other comments, and engage in discussions.
- **Payment Integration**: Stripe is integrated to handle payments for premium content. Users can unlock premium articles through secure transactions.

## Technology Stack

- **Programming Language**: TypeScript
- **Web Framework**: Next.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod
- **Authentication**: JWT (JSON Web Token)
- **Payment Gateway**: Stripe for handling secure payments

## Setup and Installation

### Clone the Repository

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/fishcove-backend.git
   cd fishcove-backend

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

## API Endpoints

- **Register User**:  
  _Endpoint_: `/api/auth/register`  
  _Method_: `POST`  
  Allows a new user to create an account by providing essential details like name, email, password, and phone number.

  **Request Body**:

  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890"
  }
  ```

### **Login User**

- **Endpoint**: `/api/auth/login`
- **Method**: `POST`
- **Description**:  
  Authenticates an existing user by verifying their email and password, returning a JWT token for secure access.

**Request Body**:

````json
{
  "email": "john@example.com",
  "password": "password123"
}

### **Create Article**
* **Endpoint**: `/api/articles`
* **Method**: `POST`
* **Authentication Required**
* **Description**:
  Authenticated users can create new articles by providing details such as the title, content, category, and whether the article is premium.

**Request Body**:
```json
{
  "title": "Fish Tank Maintenance Tips",
  "content": "Content about maintaining fish tanks...",
  "category": "Tip",
  "isPremium": true
}

### **Get All Articles**
* **Endpoint**: `/api/articles`
* **Method**: `GET`
* **Description**:
  Retrieves a list of all published articles, including both tips and stories. Users can view both premium and free content based on their access level.

---

### **Upvote Article**
* **Endpoint**: `/api/articles/:id/upvote`
* **Method**: `POST`
* **Authentication Required**
* **Description**:
  Allows authenticated users to upvote an article, helping to surface valuable content within the community.

---

### **Unlock Premium Content**
* **Endpoint**: `/api/payments`
* **Method**: `POST`
* **Authentication Required**
* **Description**:
  Users can make payments to unlock premium articles. The endpoint handles secure payments through Stripe to provide access to exclusive content.

**Request Body**:
```json
{
  "articleId": "article_id"
}


## Deployment

* **Deploy to Vercel**: Connect the repository, add environment variables, and deploy using the Vercel dashboard.

## Future Enhancements

* **PDF Generation**: Generate fish care guides in PDF format.
* **Notifications**: Real-time notifications for new articles and comments.
* **Mobile App**: Develop a mobile version of FishCove.



## Error Handling

Validation errors from Zod are handled explicitly in the controllers, and other errors are passed to the error handling middleware.

- **Validation Errors:**

  - If validation fails, a 400 status code is returned with a detailed error message.

- **Not Found Errors:**

  - Unmatched routes return a 400 status code with a "Route not found" message.

- **General Errors:**

  - A 400 status code is returned for any unhandled errors, with a generic error message.

- **Error Response Object:**

````

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
```
