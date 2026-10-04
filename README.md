# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

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

## Progressive Web App

Public recipes and optimized photos download automatically for offline reading. Wait for **Available offline** before disconnecting. Recipe management and sign-in remain online-only; admin writes are not queued.

The service worker runs only in production. Test with `npm run build` followed by `npm run start` on localhost, or deploy over HTTPS for mobile installation. `npm run dev` intentionally does not register a worker.

- `npm run assets:generate`: rebuild logos, icons, and Apple launch images from the root logo export.
- `npm run test:unit`: local storage, filter, image-key, and route-policy tests.
- `npx playwright install chromium`: install the browser needed for end-to-end checks.
- `npm run test:pwa`: production browser tests; build first. The test runner starts a server on port 3110.

See [the implementation plan and operating notes](docs/pwa-implementation-plan.md) for the architecture, platform limitations, recovery procedure, and remaining physical-device checks.
