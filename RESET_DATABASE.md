# How to Reset Database

## Steps to Reset Database and Remove Duplicates

### Step 1: Stop the Server
In the terminal where `npm run dev` is running:
- Press `Ctrl+C` to stop the server
- Wait until you see the command prompt again

### Step 2: Delete the Database
After the server is stopped, run:
```powershell
cd server
Remove-Item database\events.db -Force
```

### Step 3: Restart the Server
```powershell
cd ..
npm run dev
```

The database will be automatically recreated with:
- ✅ Only 4 unique venues (no duplicates)
- ✅ Original prices with ₹ symbol (not multiplied)
- ✅ All sample vendors with ₹ symbol

## What Changed

1. **Fixed duplicate prevention**: Added UNIQUE constraints and checks
2. **Reverted prices**: Changed from multiplied values back to original (just symbol change)
3. **Currency symbol**: All prices now show ₹ instead of $

## After Restart

You should see:
- Grand Ballroom - ₹5,000 per day
- Garden Pavilion - ₹3,000 per day  
- Conference Center - ₹4,000 per day
- Beach Resort - ₹6,000 per day

No more duplicates!

