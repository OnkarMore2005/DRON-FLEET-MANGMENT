// Simple in-memory database implementation
type Row = Record<string, any>;

interface Table {
  name: string;
  rows: Row[];
  autoIncrement: number;
}

class SimpleDB {
  private tables: Map<string, Table> = new Map();

  exec(sql: string) {
    // Simple CREATE TABLE parser
    if (sql.includes('CREATE TABLE IF NOT EXISTS')) {
      const match = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
      if (match) {
        const tableName = match[1];
        if (!this.tables.has(tableName)) {
          this.tables.set(tableName, {
            name: tableName,
            rows: [],
            autoIncrement: 1
          });
        }
      }
    }
  }

  pragma(command: string) {
    // Ignore pragma commands
  }

  prepare(sql: string) {
    const self = this;
    
    return {
      run(...params: any[]) {
        // INSERT
        if (sql.includes('INSERT INTO')) {
          const match = sql.match(/INSERT INTO (\w+)/);
          if (match) {
            const tableName = match[1];
            const table = self.tables.get(tableName);
            if (table) {
              const values = params as any[];
              const columns = sql.match(/\((.*?)\)/)?.[1].split(',').map(c => c.trim()) || [];
              const row: Row = { id: table.autoIncrement++ };
              columns.forEach((col, i) => {
                row[col] = values[i];
              });
              table.rows.push(row);
              return { lastInsertRowid: row.id, changes: 1 };
            }
          }
        }
        
        // UPDATE
        if (sql.includes('UPDATE')) {
          const match = sql.match(/UPDATE (\w+)/);
          if (match) {
            const tableName = match[1];
            const table = self.tables.get(tableName);
            if (table) {
              // Simple UPDATE SET col = ? WHERE id = ?
              const setMatch = sql.match(/SET (.*?) WHERE/);
              const whereMatch = sql.match(/WHERE (.*?)$/);
              
              if (setMatch && whereMatch) {
                const setClauses = setMatch[1].split(',').map(c => c.trim());
                let paramIndex = 0;
                
                table.rows.forEach(row => {
                  // Check WHERE condition
                  if (whereMatch[1].includes('id = ?') && row.id === params[params.length - 1]) {
                    setClauses.forEach(clause => {
                      const colName = clause.split('=')[0].trim();
                      row[colName] = params[paramIndex++];
                    });
                  }
                });
              }
              return { changes: 1 };
            }
          }
        }
        
        // DELETE
        if (sql.includes('DELETE FROM')) {
          const match = sql.match(/DELETE FROM (\w+)/);
          if (match) {
            const tableName = match[1];
            const table = self.tables.get(tableName);
            if (table) {
              const whereMatch = sql.match(/WHERE (.*?)$/);
              if (whereMatch && whereMatch[1].includes('id = ?')) {
                const id = params[0];
                const index = table.rows.findIndex(r => r.id === id);
                if (index !== -1) {
                  table.rows.splice(index, 1);
                  return { changes: 1 };
                }
              }
              return { changes: 0 };
            }
          }
        }
        
        return { changes: 0, lastInsertRowid: undefined };
      },
      
      get(...params: any[]) {
        // SELECT single row
        if (sql.includes('SELECT')) {
          const match = sql.match(/FROM (\w+)/);
          if (match) {
            const tableName = match[1];
            const table = self.tables.get(tableName);
            if (table) {
              const whereMatch = sql.match(/WHERE (.*?)$/);
              if (whereMatch) {
                const condition = whereMatch[1];
                
                return table.rows.find(row => {
                  if (condition.includes('email = ?')) return row.email === params[0];
                  if (condition.includes('id = ?')) return row.id === params[0];
                  if (condition.includes('user_id = ?')) return row.user_id === params[0];
                  if (condition.includes('booking_id = ?')) return row.booking_id === params[0];
                  return false;
                });
              }
              return table.rows[0];
            }
          }
        }
        return undefined;
      },
      
      all(...params: any[]) {
        // SELECT multiple rows
        if (sql.includes('SELECT')) {
          const match = sql.match(/FROM (\w+)/);
          if (match) {
            const tableName = match[1];
            const table = self.tables.get(tableName);
            if (table) {
              const whereMatch = sql.match(/WHERE (.*?)(?:ORDER BY|$)/);
              
              let results = [...table.rows];
              
              if (whereMatch) {
                const condition = whereMatch[1].trim();
                results = results.filter(row => {
                  if (condition.includes('category = ?')) return row.category === params[0];
                  if (condition.includes('user_id = ?')) return row.user_id === params[0];
                  if (condition.includes('provider_id = ?')) return row.provider_id === params[0];
                  if (condition.includes('status = ?')) return row.status === params[0];
                  if (condition.includes('role = ?')) return row.role === params[0];
                  return true;
                });
              }
              
              return results;
            }
          }
        }
        return [];
      }
    };
  }
}

export const db = new SimpleDB();

export const initDatabase = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('USER', 'PROVIDER', 'ADMIN')),
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Providers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      company TEXT NOT NULL,
      cities TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')),
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Drones table
  db.exec(`
    CREATE TABLE IF NOT EXISTS drones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      price_per_hour REAL NOT NULL,
      available INTEGER DEFAULT 1,
      specs TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
    )
  `);

  // Services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      base_price REAL NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      drone_id INTEGER,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
      amount REAL NOT NULL,
      duration_hours INTEGER DEFAULT 1,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
      FOREIGN KEY (drone_id) REFERENCES drones(id) ON DELETE SET NULL
    )
  `);

  // Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
      fake_order_id TEXT NOT NULL,
      fake_payment_id TEXT,
      payment_method TEXT DEFAULT 'CARD',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database initialized successfully (in-memory)');
};
