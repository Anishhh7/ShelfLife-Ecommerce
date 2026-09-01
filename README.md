# ShelfLife Ecommerce Backend

A production-oriented **multi-vendor ecommerce backend API** built with **Node.js, Express, TypeScript, PostgreSQL, and Prisma**.

ShelfLife supports customers, vendors, staff, and administrators with features including authentication, product management, cart and orders, payments, reviews, wishlist, image management, order tracking, email processing, and role-based access control.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* User registration and login
* JWT-based authentication
* Protected routes
* Role-based access control
* Customer, Vendor, Staff, and Admin roles
* Password hashing with bcrypt
* Forgot password / password reset flow
* OTP/email-based authentication flows
* Permission-based administration
* Account approval workflow

---

### 👤 User Management

* Customer profile management
* Vendor profile management
* Staff management
* Profile picture upload
* Profile information updates
* Role management
* Vendor approval management

---

### 🏪 Vendor Management

* Vendor registration
* Vendor approval by administration
* Vendor profile management
* Vendor product management
* Vendor order management
* Vendor-specific permissions
* Vendor profile image management

---

### 📦 Product Management

* Create products
* Update products
* Delete products
* Product activation/deactivation
* Product search
* Product filtering
* Product sorting
* Pagination
* Category-based products
* Vendor-based products
* Product image upload
* Cloudinary image storage
* Stock management
* Product availability validation

---

### 🗂️ Category Management

* Create categories
* Update categories
* Delete categories
* Category activation
* Category cover image
* Cloudinary image upload
* Product-category relationships

---

### 🛒 Cart

* Add products to cart
* Update cart items
* Remove cart items
* View cart
* Product quantity management
* Stock validation
* Cart total calculation
* Selected-item checkout

---

### 📋 Orders

* Place orders
* Order number generation
* Multiple products per order
* Address-based shipping
* Order subtotal calculation
* Shipping calculation
* Tax calculation
* Discount handling
* Total amount calculation
* Order history
* Order tracking
* Order item management

---

### 🚚 Order Tracking

Order items support a controlled status flow:

```text
Pending
   ↓
Confirmed
   ↓
Packed
   ↓
Shipped
   ↓
OutForDelivery
   ↓
Delivered
```

Administration can also cancel orders where appropriate.

Order status history is stored for tracking and auditing purposes.

---

### 💳 Payments

* Payment method management
* Payment status tracking
* Stripe integration
* Stripe webhook handling
* Payment verification
* Failed payment handling
* Cash on Delivery support
* Payment-related order validation

Supported payment methods include:

* Credit Card
* Debit Card
* Wallet
* Cash on Delivery

---

### ❤️ Wishlist

* Add product to wishlist
* Remove product from wishlist
* View wishlist
* Prevent duplicate wishlist items
* User-specific wishlist management

---

### ⭐ Reviews

Customers can review products they have purchased.

Review functionality includes:

* Create review
* Update review
* Delete review
* Product reviews
* Rating system
* Purchase eligibility validation
* Delivered-order validation
* Review listing
* Review filtering and pagination

Only eligible customers can submit reviews based on their completed purchases.

---

### 🖼️ Image Management

Cloudinary is used for image storage.

Supported image functionality includes:

* User profile pictures
* Vendor profile pictures
* Product images
* Category cover images
* Image upload validation
* Cloudinary folder organization
* Image URL storage

---

### 📧 Email System

Email processing is implemented using:

* Nodemailer
* Redis
* BullMQ

Email jobs can be processed asynchronously instead of blocking API requests.

Examples include:

* Account-related emails
* Password reset emails
* OTP emails
* Order emails
* Delivery notifications
* Cancellation notifications
* Vendor notifications
* Administration notifications

---

### ⚡ Redis & BullMQ

Redis is used as the queue backend.

BullMQ handles background jobs such as email processing.

Architecture:

```text
API Request
    ↓
Create Job
    ↓
BullMQ
    ↓
Redis
    ↓
Email Worker
    ↓
Nodemailer
    ↓
Email Provider
```

This keeps long-running background tasks outside the main request-response cycle.

---

### 🛡️ Security

Security-related middleware and practices include:

* Helmet
* CORS
* HTTP Parameter Pollution protection
* Rate limiting
* JWT authentication
* Password hashing
* Request validation
* Role-based authorization
* Permission-based authorization
* Disabled `x-powered-by`
* Secure error handling
* Environment-based configuration

---

### ✅ Validation

Request validation is handled using **Zod**.

Validation is applied to areas such as:

* Authentication
* Products
* Categories
* Cart
* Orders
* Payments
* Reviews
* Wishlist
* Addresses
* Administration

Invalid requests are rejected before reaching the business logic.

---

### 🧯 Error Handling

The API uses centralized error handling.

Handled errors include:

* Validation errors
* Authentication errors
* Authorization errors
* Database errors
* Prisma errors
* Resource-not-found errors
* Invalid requests
* Route-not-found errors
* Payment errors

---

### 📝 Logging

Structured logging is implemented using:

* Pino
* Pino Pretty
* Morgan

Logging is used for:

* Application events
* Errors
* Requests
* Database-related operations
* Background jobs
* Email processing

---

### 📊 Administration

Administration functionality includes:

* User management
* Vendor approval
* Staff management
* Product management
* Category management
* Order management
* Order status management
* Payment management
* Permission management
* Dashboard-related functionality

---

# 🏗️ Tech Stack

## Backend

* Node.js
* Express 5
* TypeScript

## Database

* PostgreSQL
* Prisma ORM

## Authentication

* JSON Web Tokens
* bcryptjs

## Validation

* Zod

## File Storage

* Cloudinary
* Multer

## Payments

* Stripe

## Background Jobs

* BullMQ
* Redis
* ioredis

## Email

* Nodemailer

## Security

* Helmet
* CORS
* Express Rate Limit
* HPP

## Logging

* Pino
* Pino Pretty
* Morgan

---

# 📁 Project Structure

ShelfLife-v2/
│
├── src/
│   │
│   ├── config/
│   │
│   ├── controller/
│   │
│   ├── queue/
│   │   └── email.worker.ts
│   │
│   ├── router/
│   │
│   ├── service/
│   │
│   ├── utils/
│   │
│   ├── validation/
│   │
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md

# 🗄️ Database

ShelfLife uses **PostgreSQL** with **Prisma ORM**.

The database contains relationships between major entities such as:

```text
User
 │
 ├── Address
 ├── Cart
 ├── Order
 ├── Review
 └── Wishlist
       │
       ↓
     Product
       │
       ↓
    Category
       │
       ↓
     Vendor
```

Orders additionally contain order items and status history.

---

# 🔄 Order Flow

A typical customer purchase follows this flow:

```text
Customer
   ↓
Browse Products
   ↓
Add to Cart
   ↓
Select Items
   ↓
Select Address
   ↓
Place Order
   ↓
Payment
   ↓
Order Created
   ↓
Vendor Confirms
   ↓
Packed
   ↓
Shipped
   ↓
Out for Delivery
   ↓
Delivered
   ↓
Customer Can Review Product
```

---

# 🔐 Role Structure

ShelfLife supports multiple roles:

```text
Admin
 │
 ├── Manage Users
 ├── Manage Vendors
 ├── Manage Staff
 ├── Manage Products
 ├── Manage Categories
 ├── Manage Orders
 └── Manage Permissions
     
Vendor
 │
 ├── Manage Products
 ├── Manage Orders
 └── Manage Store/Profile

Customer
 │
 ├── Browse Products
 ├── Cart
 ├── Wishlist
 ├── Orders
 ├── Payments
 └── Reviews

Staff
 │
 └── Administrative operations based on permissions
```

---

# 📋 Prerequisites

Before setting up ShelfLife v2, make sure the following are installed and configured on your system.

### Required Software

* **Node.js** — v20+ recommended
* **npm** — included with Node.js
* **PostgreSQL** — database server
* **Redis** — required for BullMQ background jobs
* **Git** — for cloning and version control

### Required Accounts / Services

The following services are required for the corresponding features:

* **Cloudinary** — for product, category, user, and vendor image storage
* **Stripe** — for payment processing and webhooks
* **SMTP provider** — for sending emails

### Development Tools

Recommended:

* VS Code or another TypeScript-compatible IDE
* Postman or another API testing tool
* GitHub account for repository access

### Verify Installation

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

Check Git:

```bash
git --version
```

Check PostgreSQL:

```bash
psql --version
```

Check Redis:

```bash
redis-cli --version
```

Redis should respond to:

```bash
redis-cli ping
```

Expected:

```text
PONG
```

### Environment Configuration

Before starting the application, create a `.env` file and configure:

* PostgreSQL database connection
* JWT configuration
* Redis connection
* Cloudinary credentials
* Stripe credentials
* SMTP credentials

See the **Environment Variables** section below for the required configuration.


# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/Anishhh7/ShelfLife-v2.git
```

## 2. Navigate into the project

```bash
cd ShelfLife-v2
```

## 3. Install dependencies

```bash
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file in the project root.

Example:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_jwt_expiration

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASSWORD=your_smtp_password
```

**Never commit real credentials or `.env` files to GitHub.**

---

# 🗃️ Prisma Setup

Generate the Prisma client:

```bash
npx prisma generate
```

Apply migrations:

```bash
npx prisma migrate dev
```

For production:

```bash
npx prisma migrate deploy
```

---

# ▶️ Running the Application

### Development

```bash
npm run dev
```

The server runs using:

```text
src/server.ts
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

The compiled application runs from:

```text
dist/server.js
```

---

# 🔴 Redis

Redis is required for BullMQ background jobs.

Check Redis:

```bash
redis-cli ping
```

Expected:

```text
PONG
```

Check the Redis service on Linux/WSL:

```bash
systemctl status redis-server
```

---

# 📬 API Base URL

During local development:

```text
http://localhost:3000/api/v1
```

Major API groups include:

```text
/api/v1/auth
/api/v1/administrations
/api/v1/addresses
/api/v1/categories
/api/v1/products
/api/v1/carts
/api/v1/orders
/api/v1/reviews
/api/v1/wishlists
/api/v1/payment
```

---

# 🧪 Testing

The project currently focuses on the application backend and does not include the previous legacy test suite.

Before deployment, API endpoints can be manually verified using tools such as Postman or another API client.

Recommended verification areas:

* Authentication
* Authorization
* Product management
* Cart
* Orders
* Payments
* Reviews
* Wishlist
* Image uploads
* Email queue
* Redis/BullMQ
* Vendor operations
* Administration operations

---

# ☁️ External Services

ShelfLife integrates with external services for specific functionality:

| Service       | Purpose            |
| ------------- | ------------------ |
| PostgreSQL    | Primary database   |
| Cloudinary    | Image storage      |
| Stripe        | Payment processing |
| Redis         | Queue storage      |
| SMTP Provider | Email delivery     |

---

# 🔒 Security Notes

Before deploying the application:

* Use strong JWT secrets
* Never expose API secrets
* Never commit `.env`
* Configure Stripe webhook secrets
* Configure production CORS properly
* Use HTTPS
* Use secure cookies where applicable
* Configure Redis securely
* Use production database credentials
* Configure appropriate rate limits

---

# 📈 Future Improvements

Possible future enhancements include:

* Automated integration testing
* API documentation with OpenAPI/Swagger
* Redis caching
* Advanced product search
* Inventory transaction history
* Refund automation
* Return management
* Customer notifications
* Admin analytics
* Monitoring and error tracking
* CI/CD pipeline
* Docker containerization
* Production deployment

---

# 🎯 Project Goals

ShelfLife was built to demonstrate a realistic backend architecture for a multi-vendor ecommerce platform.

The project focuses on:

* REST API design
* TypeScript backend development
* PostgreSQL database design
* Prisma ORM
* Authentication and authorization
* Role and permission management
* Ecommerce business logic
* Payment processing
* Image management
* Background job processing
* Redis and BullMQ
* Email processing
* Validation
* Error handling
* Security
* Logging
* Scalable backend architecture

---

# 👨‍💻 Author

**Anishhh7**

GitHub:

```text
https://github.com/Anishhh7
```

Repository:

```text
https://github.com/Anishhh7/ShelfLife-v2
```

---

# 📄 License

This project is licensed under the ISC License.
