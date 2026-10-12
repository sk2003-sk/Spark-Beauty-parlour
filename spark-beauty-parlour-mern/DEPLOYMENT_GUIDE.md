# Spark Beauty Parlour - Deployment Guide

## Pre-Deployment Checklist ✅

- [x] MongoDB Atlas configured and connected
- [x] Database seeded with 16 services
- [x] Admin account created: kalavijay@example.com / KalaVijay02
- [x] Code pushed to GitHub: https://github.com/sk2003-sk/Spark-Beauty-parlour
- [x] Environment files configured

---

## Part 1: Deploy Server to Render

### Step 1: Create Render Account (2 minutes)

1. Go to: https://render.com
2. Click "Sign Up" (top right)
3. Click "Sign up with GitHub"
4. Click "Authorize Render" when GitHub asks
5. You're now logged in!

### Step 2: Deploy the Server (5 minutes)

1. Click "New+" button (top right)
2. Click "Web Service"
3. Find your repository: `sk2003-sk/Spark-Beauty-parlour`
4. Click "Connect" next to it

### Step 3: Configure the Service

Fill in these EXACT values:

**Basic Settings:**
- Name: `spark-beauty-server`
- Region: Singapore (ap-southeast-1) [or closest to you]

**Build & Deploy:**
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `node src/index.js`

**Instance:**
- Type: Free (default)

### Step 4: Add Environment Variables

Scroll down to "Advanced" → "Add Environment Variable"

Add these ONE BY ONE (click "Add Environment Variable" for each line):

```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://KalaVijay:KalaVijay02@cluster0.f7aswzu.mongodb.net/spark-beauty?retryWrites=true&w=majority
JWT_ACCESS_SECRET=spark_beauty_access_secret_key_2024_secure_random_string
JWT_REFRESH_SECRET=spark_beauty_refresh_secret_key_2024_secure_random_string_different
CLIENT_URL=https://spark-beauty.vercel.app
TIMEZONE=Asia/Kolkata
OPEN_HOUR=10
CLOSE_HOUR=20
SLOT_CAPACITY=2
BOOKING_WINDOW_DAYS=14
ADMIN_EMAIL=kalavijay@example.com
ADMIN_PASSWORD=KalaVijay02
ADMIN_PHONE=8500512643
```

### Step 5: Deploy

1. Scroll to bottom
2. Click "Create Web Service"
3. Wait 2-5 minutes (watch the logs)
4. When it says "Live" with green checkmark - SUCCESS!

### Step 6: Copy Your Server URL

Look at the top of the page - you'll see something like:
```
https://spark-beauty-server.onrender.com
```
or
```
https://spark-beauty-server-xxxx.onrender.com
```

**COPY THIS URL** - you'll need it for Part 2!

### Step 7: Seed the Database

1. On your service page, click "Shell" (top menu)
2. In the terminal, type: `npm run seed`
3. Press Enter
4. You should see:
   ```
   MongoDB connected
   Services added: 16
   Admin account created: kalavijay@example.com
   ```

---

## Part 2: Deploy Client to Vercel

### Step 1: Create Vercel Account (2 minutes)

1. Go to: https://vercel.com
2. Click "Sign Up"
3. Click "Continue with GitHub"
4. Authorize Vercel when GitHub asks
5. You're now logged in!

### Step 2: Deploy the Client (3 minutes)

1. Click "Add New" → "Project"
2. Find your repository: `sk2003-sk/Spark-Beauty-parlour`
3. Click "Import"

### Step 3: Configure the Project

**Framework Preset:** Vite (should auto-detect)
**Root Directory:** `client`
**Override Directory:** Leave empty

### Step 4: Add Environment Variable

Scroll to "Environment Variables"

Add this ONE variable:
```
VITE_API_URL=https://YOUR_RENDER_SERVER_URL.onrender.com/api
```

**IMPORTANT:** Replace `YOUR_RENDER_SERVER_URL.onrender.com` with your actual Render URL from Part 1!

Example:
```
VITE_API_URL=https://spark-beauty-server.onrender.com/api
```

### Step 5: Deploy

1. Click "Deploy"
2. Wait 1-2 minutes
3. When done, you'll see your Vercel URL like:
   ```
   https://spark-beauty.vercel.app
   ```

---

## Part 3: Update CLIENT_URL on Render

Now we need to update the server to know about the Vercel URL:

1. Go back to Render dashboard
2. Click on "spark-beauty-server"
3. Scroll to "Environment Variables"
4. Find `CLIENT_URL` and edit it
5. Change to your actual Vercel URL:
   ```
   CLIENT_URL=https://YOUR_VERCEL_URL.vercel.app
   ```
6. Click "Save Changes"
7. Render will automatically redeploy (1-2 minutes)

---

## Part 4: Test Your Deployment

### Test the Admin Login:

1. Open your Vercel URL in browser
2. Click "Login"
3. Enter:
   - Email: `kalavijay@example.com`
   - Password: `KalaVijay02`
4. You should see the Admin dashboard!

### Test Customer Booking:

1. Click "Logout"
2. Click "Create account"
3. Register as a new customer
4. Try booking a service!

---

## Important URLs After Deployment

- **MongoDB Atlas:** https://cloud.mongodb.com
- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Your App:** [Your Vercel URL]
- **Your API:** [Your Render URL]

---

## Admin Credentials

- **Email:** kalavijay@example.com
- **Password:** KalaVijay02
- **Database:** MongoDB Atlas (cluster0.f7aswzu.mongodb.net)

---

## Troubleshooting

### If Render deployment fails:
- Check the logs in Render dashboard
- Make sure MONGO_URI is correct
- Make sure all environment variables are set

### If Vercel deployment fails:
- Check Vercel deployment logs
- Make sure VITE_API_URL is correct
- Make sure it ends with `/api`

### If admin login doesn't work:
- Make sure you ran `npm run seed` on Render
- Check the database has the admin user
- Try logging in again

---

## Need Help?

If you get stuck at any step, tell me:
1. Which step you're on
2. What error message you see
3. What you see on the screen

I'll help you fix it!
