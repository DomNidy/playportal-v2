# SaaS Starter

## Steps

1. Init supabase with `npx supabase init`

2. Link supabase project with `npx supabase link`

3. Gen types with `npx supabase gen types typescript --linked > types_db.ts`

Note: We use prisma, but also the supabase generated types. This prevents some eslint errors with the supabase client.

### When to use prisma client, and when to use supabase client?

We will use the prisma client on our backend for complex queries, as well as for easier generation of migrations.

We will use the supabase js client on the client side to listen for realtime updates using supabase subscriptions.

## What's next? How do I make an app with this?

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
