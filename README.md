This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## MongoDB Atlas

Create a `.env.local` file in the project root and set `MONGODB_URI` to your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/bstore?retryWrites=true&w=majority
```

Replace the placeholders with your Atlas database user and cluster host. URL-encode special characters in the password, and make sure the database user and your current IP address are permitted in Atlas. Keep `.env.local` private and do not commit it.

The product and category API endpoints use this connection. To seed sample categories and products when the catalog has no existing data, run:

```bash
npm run seed
```

The seed script never deletes existing catalog data and skips seeding if products or categories already exist.

### Authentication

Set `JWT_SECRET` in `.env.local` to a private random value of at least 32 characters. Registration and sign-in create a signed session in an HTTP-only cookie; registration signs the new user in automatically.

The cart is stored in the browser separately for each signed-in account. Guest items are kept separately and move to an account's cart the first time that account signs in on the browser.

### Password reset

Password reset tokens are random, one-time tokens stored as SHA-256 hashes and expire after one hour. In development, the reset link is printed in the server console; configure `APP_URL` to set its base URL. The API returns the same confirmation for known and unknown email addresses. Configure an email provider before enabling password-reset delivery in production.

### Product image uploads

Add `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `AWS_S3_BUCKET_NAME` to `.env.local`. Use an IAM user or role with only the `s3:PutObject` permission for the bucket's `products/*` key prefix. The `/admin` page manages products and requires a signed-in account with the `ADMIN` role; its product creation API also checks this role. The `/api/upload` endpoint accepts JPEG, PNG, WebP, or AVIF images up to 5 MB and likewise requires an admin. New accounts are regular users; grant admin access deliberately through your trusted database administration workflow.

The bucket must allow public reads for the `products/*` prefix for the returned S3 image URLs to load in the storefront. Replace `YOUR_BUCKET_NAME` in this policy with your bucket name, and allow the policy through the bucket's Block Public Access settings. This grants public reads only; do not enable public writes:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadProductImages",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/products/*"
    }
  ]
}
```

An image upload component is available at `src/components/ImageUpload.js`. In a product form, pass a callback such as `<ImageUpload imageUrl={imageUrl} onUploadComplete={setImageUrl} />`, then submit that returned `imageUrl` with the other product fields to `/api/products`; the product model already requires and stores `imageUrl`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
