# API Connection Troubleshooting Guide

## Correct Command
```bash
npm run dev
```
NOT `npm start dev` or `npm start` (those don't use watch mode)

## Step-by-Step Fix

### 1. Check if server is running
After running `npm run dev`, you should see:
```
Server is running on port 3000
```
If you don't see this, the server isn't starting. Check for errors above.

### 2. Test the API directly
Open your browser and go to:
```
http://localhost:3000
```
You should see a response (or at least not get "connection refused")

### 3. Common Issues

#### Issue A: CORS Error
**Error:** `Access to fetch at 'http://localhost:3000/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution:** 
- Create a `.env` file in project root:
```
FRONTEND_URL=http://localhost:5173
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

#### Issue B: Connection Refused
**Error:** `Failed to fetch` or `Connection refused`

**Solutions:**
1. Make sure server is running (`npm run dev`)
2. Check if port 3000 is already in use:
   ```powershell
   netstat -ano | findstr :3000
   ```
3. Try changing port in `.env`:
   ```
   PORT=3001
   ```
   Then frontend should connect to `http://localhost:3001`

#### Issue C: Frontend can't find API
**Check frontend API base URL:**
- If using Vite/React: check `vite.config.ts` or `axios` baseURL
- Should be: `http://localhost:3000` (or your port)
- NOT `http://localhost:5173` (that's frontend port)

### 4. Quick Test
Run this in browser console or Postman:
```javascript
fetch('http://localhost:3000')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error)
```

### 5. Windows Firewall
If other devices can't connect:
1. Open Windows Defender Firewall
2. Allow Node.js through firewall
3. Or allow port 3000 inbound

## Still Not Working?
1. Check server terminal for errors
2. Verify `.env` file exists and has correct values
3. Make sure database is running
4. Check frontend console for exact error message

