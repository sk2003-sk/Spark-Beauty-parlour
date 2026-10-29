# Spark Beauty Parlour (MERN)

A booking app for a beauty parlour. Customers browse services, pick a free time slot and book. The owner confirms or cancels bookings and manages the menu from a dashboard.

**Stack:** MongoDB, Express, React (Vite), Node.js

## Folder structure

```
spark-beauty-parlour-mern/
  server/
    src/
      index.js            starts the server
      app.js              Express setup: helmet, cors, rate limits, routes
      config.js           reads and checks environment variables
      db.js               MongoDB connection
      seed.js             adds the menu and the owner login
      models/             User, Service, Slot, Booking
      routes/             auth, services, bookings, admin
      middleware/         auth (JWT and roles), validate (zod), errors
      utils/              time zone helpers, atomic slot booking, ApiError
  client/
    src/
      main.jsx, App.jsx   providers and routes
      api/client.js       axios with automatic token refresh
      context/            AuthContext, CartContext
      hooks/              useServices, useDebounce
      components/         Layout, ProtectedRoute, ServiceRow, Icon, Skeleton, ErrorBoundary
      pages/              Home, Services, Auth, Booking, MyBookings, Admin
      lib/                constants and formatting helpers
      index.css           responsive styles (phone, tablet, desktop)
```

## Run it on your computer

You need Node.js 18 or newer and a MongoDB database (local, or a free MongoDB Atlas cluster).

1. Server
   ```
   cd server
   cp .env.example .env      # then edit .env: set MONGO_URI, two long random secrets, ADMIN_EMAIL, ADMIN_PASSWORD
   npm install
   npm run seed              # adds the services and creates the owner login
   npm run dev               # API on http://localhost:5000
   ```
2. Client (in a second terminal)
   ```
   cd client
   cp .env.example .env
   npm install
   npm run dev               # website on http://localhost:5173
   ```
3. Open http://localhost:5173. Log in with ADMIN_EMAIL and ADMIN_PASSWORD to see the Admin button.

## Advanced concepts used

- **Secure login:** a 15 minute access token kept in memory plus a 7 day refresh token in an httpOnly cookie. The browser refreshes the session on its own. Logging out signs the account out of every device (token version).
- **Roles:** customer and admin. Admin routes are protected on the server, not only hidden in the page.
- **No double booking:** each hour has a seat counter. A single atomic MongoDB update takes a seat, and a unique index stops two people taking the last one. If saving fails, the seat is returned.
- **Prices come from the database:** the server calculates totals from the saved menu, so a customer cannot change a price from the browser.
- **Validation everywhere:** zod checks every request. Bad input returns clear field errors that the forms show.
- **Security basics:** helmet, CORS allow list, rate limiting, bcrypt password hashing, request size limit.
- **MongoDB aggregation:** the dashboard counts, revenue and most booked services are calculated inside MongoDB.
- **Snapshots:** a booking stores the service names and prices at booking time, so old bookings stay correct if you change the menu.
- **React Query:** cached data, optimistic cancel (the card updates instantly and rolls back on error), paginated admin list.
- **Code splitting:** the Booking, My bookings and Admin pages load only when opened.
- **Responsive design:** mobile first CSS. Phones get a bottom tab bar, tablets and desktops get a top navigation. It respects phone safe areas, dark mode and reduced motion.
- **Accessibility:** labelled fields, visible keyboard focus, button states announced to screen readers.

## API

| Method | Path | Who |
| --- | --- | --- |
| POST | /api/auth/register, /login, /refresh, /logout | public |
| GET | /api/auth/me | logged in |
| GET | /api/services | public |
| GET, POST, PATCH, DELETE | /api/services/all, /api/services, /api/services/:id | admin |
| GET | /api/bookings/availability?date=YYYY-MM-DD | public |
| POST | /api/bookings | logged in |
| GET | /api/bookings/mine | logged in |
| PATCH | /api/bookings/:id/cancel | owner of the booking or admin |
| GET | /api/admin/bookings, /api/admin/stats | admin |
| PATCH | /api/admin/bookings/:id/status | admin |

## Deploy

1. **Database:** create a free cluster on MongoDB Atlas and copy its connection string.
2. **Server:** deploy the `server` folder to Render, Railway or a similar host. Set the same variables as `.env`, plus `NODE_ENV=production` and `CLIENT_URL` set to your website address (for example `https://spark.vercel.app`). Run `npm run seed` once.
3. **Client:** deploy the `client` folder to Vercel. Set `VITE_API_URL` to `https://YOUR-SERVER-ADDRESS/api`. `vercel.json` already makes page refreshes work.

In production the login cookie is sent between two different addresses, so both must use https. The server already sets the cookie for that case.

## Settings you can change

In `server/.env`: `OPEN_HOUR`, `CLOSE_HOUR`, `SLOT_CAPACITY` (how many customers can book the same hour), `BOOKING_WINDOW_DAYS`, `TIMEZONE`.
In `client/.env`: `VITE_PARLOUR_PHONE`, `VITE_BOOKING_DAYS` (keep it equal to or below the server value).
Address and Maps link: `client/src/lib/constants.js`.
