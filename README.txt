august 16, 2022

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

About railway:
    The free tier at railway stops working in the last
    week of each month. It restarts automatically in the
    next month, but the password has changed. To get the 
    new password, go to https://railway.app/dashboard,
    click on the database, then click PostgresSQL, then
    click 'Variables', then copy PGPASSWORD and put this
    in the password portion of the DATABASE_URL
    in the .env file. This environmental variable also needs
    to be updated at Vercel.

In order to delete a user from the database, first the
messages to and from that user need to be deleted.

if the database structure is changed, run:
    npx prisma db push

twitch developer console:
    https://dev.twitch.tv/console/apps

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

