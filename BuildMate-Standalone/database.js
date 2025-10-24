const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database(path.join(__dirname, 'buildmate.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('📁 Database connected');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    console.log('🔧 Initializing database tables...');
    
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('distributor', 'consumer', 'manufacturer')),
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Materials table
    db.run(`
      CREATE TABLE IF NOT EXISTS materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK(category IN ('cement', 'steel', 'tiles', 'other')),
        manufacturer TEXT NOT NULL,
        grade TEXT,
        type TEXT,
        description TEXT,
        unit TEXT DEFAULT 'piece',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inventory table
    db.run(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        distributor_id INTEGER NOT NULL,
        material_id INTEGER NOT NULL,
        quantity REAL NOT NULL DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (distributor_id) REFERENCES users(id),
        FOREIGN KEY (material_id) REFERENCES materials(id),
        UNIQUE(distributor_id, material_id)
      )
    `);

    // Prices table
    db.run(`
      CREATE TABLE IF NOT EXISTS prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        distributor_id INTEGER NOT NULL,
        material_id INTEGER NOT NULL,
        price REAL NOT NULL,
        effective_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (distributor_id) REFERENCES users(id),
        FOREIGN KEY (material_id) REFERENCES materials(id)
      )
    `);

    // Notifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER,
        to_role TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user_id) REFERENCES users(id),
        FOREIGN KEY (to_user_id) REFERENCES users(id)
      )
    `);

    // Inquiries table
    db.run(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        consumer_id INTEGER NOT NULL,
        distributor_id INTEGER NOT NULL,
        material_id INTEGER NOT NULL,
        quantity REAL,
        message TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'responded', 'closed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (consumer_id) REFERENCES users(id),
        FOREIGN KEY (distributor_id) REFERENCES users(id),
        FOREIGN KEY (material_id) REFERENCES materials(id)
      )
    `);

    // Seed default data
    seedDefaultData();
  });
}

function seedDefaultData() {
  // Check if users exist
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      console.error('Error checking users:', err);
      return;
    }

    if (row.count === 0) {
      console.log('👤 Creating default user accounts...');
      
      // Create default users
      const hashedPassword1 = bcrypt.hashSync('distributor123', 10);
      const hashedPassword2 = bcrypt.hashSync('consumer123', 10);
      
      db.run(`
        INSERT INTO users (email, password, name, role, phone, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['distributor@buildmate.com', hashedPassword1, 'ABC Building Supplies', 'distributor', '9876543210', '123 Warehouse Street, Mumbai'], (err) => {
        if (err) console.error('Error creating distributor:', err);
        else console.log('✅ Distributor account created');
      });
      
      db.run(`
        INSERT INTO users (email, password, name, role, phone, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['consumer@buildmate.com', hashedPassword2, 'John Contractor', 'consumer', '9876543211', '456 Construction Site, Mumbai'], (err) => {
        if (err) console.error('Error creating consumer:', err);
        else console.log('✅ Consumer account created');
      });

      // Seed materials after a short delay to ensure users are created
      setTimeout(seedMaterials, 1000);
    } else {
      console.log('✅ Database already initialized');
    }
  });
}

function seedMaterials() {
  db.get('SELECT COUNT(*) as count FROM materials', (err, row) => {
    if (err) {
      console.error('Error checking materials:', err);
      return;
    }

    if (row.count === 0) {
      console.log('📦 Seeding materials database...');
      
      // Cement materials
      const cementMaterials = [
        { name: 'OPC 43 Grade', category: 'cement', manufacturer: 'UltraTech', grade: '43', unit: 'bag' },
        { name: 'OPC 53 Grade', category: 'cement', manufacturer: 'UltraTech', grade: '53', unit: 'bag' },
        { name: 'OPC 43 Grade', category: 'cement', manufacturer: 'ACC', grade: '43', unit: 'bag' },
        { name: 'OPC 53 Grade', category: 'cement', manufacturer: 'ACC', grade: '53', unit: 'bag' },
        { name: 'PPC Cement', category: 'cement', manufacturer: 'Ambuja', grade: 'PPC', unit: 'bag' },
      ];

      // Steel materials
      const steelMaterials = [
        { name: 'TMT Bar 8mm', category: 'steel', manufacturer: 'TATA Steel', grade: 'Fe 500', unit: 'kg' },
        { name: 'TMT Bar 10mm', category: 'steel', manufacturer: 'TATA Steel', grade: 'Fe 500', unit: 'kg' },
        { name: 'TMT Bar 12mm', category: 'steel', manufacturer: 'TATA Steel', grade: 'Fe 500', unit: 'kg' },
        { name: 'TMT Bar 16mm', category: 'steel', manufacturer: 'JSW Steel', grade: 'Fe 500D', unit: 'kg' },
        { name: 'TMT Bar 20mm', category: 'steel', manufacturer: 'JSW Steel', grade: 'Fe 500D', unit: 'kg' },
      ];

      // Tiles materials
      const tilesMaterials = [
        { name: 'Vitrified Tiles 600x600', category: 'tiles', manufacturer: 'Kajaria', type: 'Vitrified', unit: 'box' },
        { name: 'Ceramic Wall Tiles', category: 'tiles', manufacturer: 'Kajaria', type: 'Ceramic', unit: 'box' },
        { name: 'Porcelain Tiles 800x800', category: 'tiles', manufacturer: 'Somany', type: 'Porcelain', unit: 'box' },
        { name: 'Floor Tiles 600x600', category: 'tiles', manufacturer: 'Somany', type: 'Ceramic', unit: 'box' },
        { name: 'Designer Wall Tiles', category: 'tiles', manufacturer: 'Nitco', type: 'Designer', unit: 'box' },
      ];

      const allMaterials = [...cementMaterials, ...steelMaterials, ...tilesMaterials];
      
      const insertMaterial = db.prepare(`
        INSERT INTO materials (name, category, manufacturer, grade, type, unit)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      allMaterials.forEach(material => {
        insertMaterial.run(
          material.name,
          material.category,
          material.manufacturer,
          material.grade || null,
          material.type || null,
          material.unit
        );
      });

      insertMaterial.finalize(() => {
        console.log('✅ Materials seeded');
        // Seed inventory and prices after materials are created
        setTimeout(seedInventoryAndPrices, 500);
      });
    }
  });
}

function seedInventoryAndPrices() {
  // Get distributor and materials
  db.get('SELECT id FROM users WHERE role = ?', ['distributor'], (err, distributor) => {
    if (err || !distributor) {
      console.error('Error getting distributor:', err);
      return;
    }

    db.all('SELECT id FROM materials', (err, materials) => {
      if (err || !materials || materials.length === 0) {
        console.error('Error getting materials:', err);
        return;
      }

      console.log('💰 Seeding inventory and prices...');

      const insertInventory = db.prepare(`
        INSERT INTO inventory (distributor_id, material_id, quantity)
        VALUES (?, ?, ?)
      `);

      const insertPrice = db.prepare(`
        INSERT INTO prices (distributor_id, material_id, price, effective_date)
        VALUES (?, ?, ?, DATE('now'))
      `);

      materials.forEach(material => {
        const quantity = Math.floor(Math.random() * 500) + 100;
        const price = Math.floor(Math.random() * 500) + 200;
        
        insertInventory.run(distributor.id, material.id, quantity);
        insertPrice.run(distributor.id, material.id, price);
      });

      insertInventory.finalize();
      insertPrice.finalize(() => {
        console.log('✅ Inventory and prices seeded');
        console.log('🎉 Database initialization complete!');
      });
    });
  });
}

module.exports = db;

