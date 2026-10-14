# BStore – High-Performance E-Commerce Platform

**[![Live Demo](https://img.shields.io/badge/Live%20Demo-b--store--five.vercel.app-000?style=for-the-badge&logo=vercel)](https://b-store-five.vercel.app/)**

BStore is a modern, minimalist full-stack e-commerce application built with the Next.js App Router, MongoDB, AWS S3, and Tailwind CSS. Its architecture combines a responsive storefront, API-driven catalog, JWT-backed sessions, and a protected product-management interface.

## Tech Stack & Architecture

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js App Router, React, Server and Client Components, Tailwind CSS 4 |
| Design system | Custom dark zinc palette, responsive layouts, reusable storefront and form components |
| Backend | Next.js Route Handlers (`app/api`), Node.js runtime for S3 uploads |
| Data | MongoDB Atlas, Mongoose ODM |
| Authentication | Signed JWT sessions in HTTP-only cookies, bcrypt password hashing |
| Object storage | AWS S3 for server-mediated product image uploads and public image delivery |
| Email | Resend for password-reset email delivery |
| Deployment | Vercel production deployment connected to GitHub for continuous delivery |

## Core Engineering Features

- **Authentication and authorization:** Registration and login create signed JWT sessions in HTTP-only cookies. Admin pages, product-management endpoints, and image uploads require the `ADMIN` role.
- **Cloud media pipeline:** The admin selects an image that is validated by the server and uploaded to S3 under a unique object key. The API returns the resolved image URL for persistence with the product.
- **Catalog and filtering:** Products and categories are loaded from MongoDB through API endpoints. The storefront supports category and gender filters, including men's, women's, and unisex product tagging.
- **Product variants:** Admins can assign sizes and colors to products. Storefront selectors preserve the selected variants in the client-side cart; cart line items track product, size, color, and quantity.
- **Admin CRUD:** The protected `/admin` dashboard supports product creation, editing, and deletion, category assignment, image uploads, and dynamic product attributes.
- **Account recovery:** Password reset uses one-time, expiring tokens stored as hashes and sends reset instructions through Resend.
- **Catalog routes:** `/` is the storefront homepage; `/products` is the full catalog. `/api/products/[id]` provides protected update and delete operations. A customer-facing `/products/[id]` detail page is not currently implemented.

## Project Structure

```text
app/
├── admin/                         # Protected product-management page
├── api/
│   ├── auth/                      # Registration, login, session, password reset
│   ├── categories/                # Category API
│   ├── products/                  # Product API and [id] update/delete handlers
│   └── upload/                    # Validated server-side S3 upload
├── cart/                          # Shopping cart
├── forgot-password/               # Password recovery request
├── login/                         # Sign-in page
├── products/                      # Catalog and category/gender filters
├── register/                      # Account registration
└── reset-password/[token]/        # Password reset form
src/
├── components/                    # Navbar, admin form, uploads, product controls
├── context/                       # Client-side cart state
├── lib/                           # Database, auth, S3, catalog and validation helpers
└── models/                        # Mongoose models for users, products, categories, orders
```

## Environment Configuration

Create a `.env.local` file in the repository root. Keep credentials private and never commit this file.

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string for the application database |
| `JWT_SECRET` | Private signing key for session and reset-token workflows; use at least 32 characters |
| `AWS_ACCESS_KEY_ID` | AWS identity used by the server to upload product images |
| `AWS_SECRET_ACCESS_KEY` | Secret key for the configured AWS identity |
| `AWS_REGION` | AWS region containing the S3 bucket |
| `AWS_S3_BUCKET_NAME` | S3 bucket used for product image objects |
| `RESEND_API_KEY` | Resend API key used to send password-reset emails |

`APP_URL` is optional; set it to the public application origin when generating password-reset links outside local development. The S3 bucket must allow public reads for uploaded product images, while upload permissions should remain restricted to the server's IAM identity.

Example configuration (replace every placeholder with a real value):

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/bstore?retryWrites=true&w=majority
JWT_SECRET=<at-least-32-character-random-secret>
AWS_ACCESS_KEY_ID=<aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<aws-secret-access-key>
AWS_REGION=<aws-region>
AWS_S3_BUCKET_NAME=<s3-bucket-name>
RESEND_API_KEY=<resend-api-key>
APP_URL=http://localhost:3000
```

## Local Development

```bash
git clone https://github.com/BakirTurkovic/BStore.git
cd BStore
npm install
```

Configure `.env.local` using the values above, then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To populate an empty catalog with the seed data, run:

```bash
npm run seed
```

The seed script does not delete existing catalog data and skips sample-product seeding when the database already contains products or categories.

## Production Build

```bash
npm run build
npm start
```

Vercel deploys the production application from the connected GitHub repository. Configure the required environment variables in the Vercel project settings as well as locally.
