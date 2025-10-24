const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('buildmate.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Database opened successfully');
    
    // Check users table
    db.all('SELECT id, email, name, role FROM users', (err, rows) => {
      if (err) {
        console.error('Error querying users:', err);
      } else {
        console.log('\nUsers in database:');
        console.log('==================');
        if (rows.length === 0) {
          console.log('No users found!');
        } else {
          rows.forEach(user => {
            console.log(`ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
          });
        }
      }
      
      // Close database
      db.close();
    });
  }
});
