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
