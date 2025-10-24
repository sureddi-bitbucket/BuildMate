# BuildMate Standalone - Installation Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
cd BuildMate-Standalone
npm install
```

### Step 2: Build Frontend
```bash
cd public
npm install
npm run build
cd ..
```

### Step 3: Start Application
```bash
npm start
```

**That's it!** Your application will be running on **http://localhost:5038**

---

## 📋 Detailed Installation

### Prerequisites
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Complete Setup Commands

```bash
# Navigate to BuildMate-Standalone folder
cd BuildMate-Standalone

# Install backend dependencies
npm install

# Install frontend dependencies and build
cd public
npm install
npm run build
cd ..

# Start the application
npm start
```

---

## 🎯 What You'll See

After running `npm start`, you should see:

```
=================================
🏗️  BuildMate Standalone Server
=================================
🌐 Server running on: http://localhost:5038
📊 API endpoints: http://localhost:5038/api
🎯 Application: http://localhost:5038
=================================
✅ Ready to use!
=================================
```

---

## 🔐 Login Credentials

### Distributor Account
- **Email:** distributor@buildmate.com
- **Password:** distributor123

### Consumer Account
- **Email:** consumer@buildmate.com
- **Password:** consumer123

---

## 🌐 Access the Application

Open your browser and go to: **http://localhost:5038**

The application will automatically:
- ✅ Load the login page
- ✅ Show "Standalone Version - Port 5038" indicator
- ✅ Provide demo account buttons for easy login

---

## 🎮 Features Available

### Distributor Portal:
- 📊 Dashboard with statistics
- 📦 Inventory management
- 💰 Price management
- 📨 Customer inquiries
- 🔔 Notifications

### Consumer Portal:
- 🏗️ Browse materials and prices
- 💬 Send inquiries to distributors
- 📊 Track inquiry status
- 🔔 Receive notifications

---

## 🛑 Stopping the Application

Press `Ctrl + C` in the terminal to stop the server.

---

## 🔄 Restarting

To restart the application:
```bash
npm start
```

---

## 📁 Project Structure

```
BuildMate-Standalone/
├── server.js              # Main server file
├── database.js            # Database setup
├── routes/                # API routes
├── middleware/            # Authentication middleware
├── public/                # Frontend React app
│   ├── src/              # React source code
│   ├── build/            # Built frontend (after npm run build)
│   └── package.json      # Frontend dependencies
├── package.json          # Backend dependencies
└── .env                  # Environment variables
```

---

## 🚨 Troubleshooting

### Port Already in Use
If port 5038 is already in use:
1. Find what's using it: `netstat -ano | findstr :5038`
2. Kill the process: `taskkill /PID [PID_NUMBER] /F`
3. Or change port in `.env` file: `PORT=5039`

### Frontend Build Errors
If `npm run build` fails:
```bash
cd public
rm -rf node_modules
npm install
npm run build
```

### Database Issues
If you encounter database errors:
1. Delete the database file: `del buildmate.db`
2. Restart the application: `npm start`
3. The database will be recreated automatically

---

## 🔧 Development Mode

For development with auto-restart:
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

---

## 📦 What's Included

✅ **Complete Backend API**
- User authentication
- Material management
- Inventory tracking
- Price management
- Notification system
- Inquiry system

✅ **Full Frontend Application**
- React-based UI
- Responsive design
- Authentication system
- Dashboard for both user types
- Real-time updates

✅ **Database**
- SQLite database (no external setup needed)
- Pre-seeded with sample data
- Automatic initialization

✅ **Standalone Operation**
- Single command to start
- No external dependencies
- Runs on port 5038
- Self-contained

---

## 🎉 Success!

Once you see the login page at **http://localhost:5038**, you have successfully:

- ✅ Installed all dependencies
- ✅ Built the frontend
- ✅ Started the server
- ✅ Initialized the database
- ✅ Created sample data

**Enjoy using BuildMate Standalone!** 🏗️

