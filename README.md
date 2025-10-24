# BuildMate Standalone

A complete, self-contained building materials distribution management system.

## Features

### 🏗️ Material Management (NEW!)
- **Complete CRUD Operations**: Add, edit, delete materials in catalog
- **Material Categories**: Cement, Steel, Tiles with manufacturers and grades
- **Detailed Material Info**: Name, category, manufacturer, grade/type, unit, description
- **Easy Material Addition**: Simple forms for adding new materials

### 📦 Enhanced Inventory Management
- **Add to Inventory**: Add materials to stock with quantities
- **Update Stock Levels**: Edit existing inventory quantities
- **Remove from Inventory**: Set quantities to zero
- **Stock Status Indicators**: Visual indicators for stock levels (In Stock, Low Stock, Critical, Out of Stock)

### 💰 Daily Pricing Management
- **Set Daily Prices**: Add prices for any material
- **Update Prices**: Change existing material prices
- **Price History**: Track when prices were last updated
- **Consumer Notifications**: Automatic notifications for price changes

### 👥 User Portals
- **Distributor Portal**: Complete material, inventory, and pricing management
- **Consumer Portal**: Browse materials, view daily prices, send inquiries
- **Real-time Notifications**: Price updates and inquiry responses
- **Standalone Operation**: Single server, no external dependencies

## Quick Start

```bash
# Install and build everything
npm run setup

# Start the application
npm start
```

**Access:** http://localhost:5038

## Demo Accounts

- **Distributor**: distributor@buildmate.com / distributor123
- **Consumer**: consumer@buildmate.com / consumer123

## Technology Stack

- **Backend**: Node.js, Express, SQLite
- **Frontend**: React, Axios
- **Authentication**: JWT
- **Database**: SQLite (embedded)

## Port

Runs on **port 5038** by default.

---

**Built for the construction industry with ❤️**

