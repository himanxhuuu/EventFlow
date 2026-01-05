# Troubleshooting Localhost Connection Issues

## Quick Fix Steps

### 1. Check if Dependencies are Installed

**Backend:**
```powershell
cd server
npm install
```

**Frontend:**
```powershell
cd client
npm install
```

**Or install all at once:**
```powershell
npm run install-all
```

### 2. Create .env File (if missing)

Create a file `server/.env` with:
```env
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Start the Application

**Option A: Start both together (recommended)**
```powershell
npm run dev
```

**Option B: Start separately (in different terminals)**

Terminal 1 - Backend:
```powershell
npm run server
```

Terminal 2 - Frontend:
```powershell
npm run client
```

### 4. Check if Ports are Available

**Backend should run on:** http://localhost:5000
**Frontend should run on:** http://localhost:3000

If you see "port already in use" error:
- Close other applications using ports 5000 or 3000
- Or change the port in `server/.env` (for backend)
- Or change the port in `client/vite.config.js` (for frontend)

### 5. Check for Errors

**Common Issues:**

1. **Database Error:**
   - Delete `server/database/events.db` if it exists
   - Restart the server (it will recreate the database)

2. **Module Not Found:**
   - Run `npm install` in both `server` and `client` directories

3. **Port Already in Use:**
   - Kill the process using the port:
     ```powershell
     # Find process on port 5000
     netstat -ano | findstr :5000
     # Kill process (replace PID with actual process ID)
     taskkill /PID <PID> /F
     ```

### 6. Verify Server is Running

Open browser and check:
- Backend: http://localhost:5000/api/health
- Should return: `{"status":"OK","message":"Event Management API is running"}`

### 7. Verify Frontend is Running

Open browser and check:
- Frontend: http://localhost:3000
- Should show the login page

## Still Not Working?

### Check Console Output

Look for error messages in the terminal. Common errors:

1. **"Cannot find module"** → Run `npm install`
2. **"Port 5000 already in use"** → Change port or kill existing process
3. **"Database locked"** → Delete `server/database/events.db` and restart
4. **"EADDRINUSE"** → Port conflict, change port number

### Manual Database Reset

If database is corrupted:
```powershell
cd server
Remove-Item database\events.db -ErrorAction SilentlyContinue
# Then restart server
npm run dev
```

### Check Node.js Version

Make sure you have Node.js v14 or higher:
```powershell
node --version
```

If version is too old, download from https://nodejs.org/

## Need More Help?

Check the terminal output for specific error messages and share them for further assistance.

