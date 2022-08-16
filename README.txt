August 16, 2022

C:\dev\t3-app

messaging app from modification of the tutorial:
    tRPC V10 IS SO GOOD!!! Oh I built a new app live too
    https://www.youtube.com/watch?v=YAzzvhaRs6M

    by Theo - ping.gg

built with the t3 stack:
nextjs, tRPC, tailwind, typescript, prisma, nextauth

start locally:
    npm run dev

look at the prisma database:
    npx prisma studio

another way to look at the database:
    https://railway.app/dashboard

In order to delete a user from the database, first the
messages to and from that user need to be deleted.

if the database structure is changed, run:
    npx prisma db push

pusher dashboard:
    https://dashboard.pusher.com/apps/1458910

deployed:
    https://t3-app-nextjs-prisma-trpc.vercel.app/

update:
    git add .
    git commit -m 'message'
    git push




the .env file looks like this:
----------
Note that not all variables here might be in use for your selected configuration

Prisma
DATABASE_URL=postgresql://postgres: ... /railway

Next Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

Next Auth Twitch Provider
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
PUSHER_APP_ID=
NEXT_PUBLIC_PUSHER_APP_KEY=
NEXT_PUBLIC_PUSHER_SERVER_HOST=localhost
NEXT_PUBLIC_PUSHER_SERVER_PORT=6001
NEXT_PUBLIC_PUSHER_SERVER_TLS=false
NEXT_PUBLIC_PUSHER_CLUSTER=us3
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=us3
----------

