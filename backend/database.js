import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'edufund.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'student' CHECK(role IN ('student', 'admin')),
    wallet_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Schools table
  CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    wallet_address TEXT UNIQUE NOT NULL,
    verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tuition Advances table
  CREATE TABLE IF NOT EXISTS advances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    school_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    duration_months INTEGER NOT NULL CHECK(duration_months BETWEEN 3 AND 6),
    interest_rate REAL NOT NULL,
    total_repayment REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted')),
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (school_id) REFERENCES schools(id)
  );

  -- Savings Buckets table
  CREATE TABLE IF NOT EXISTS savings_buckets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    frequency TEXT DEFAULT 'weekly' CHECK(frequency IN ('weekly', 'biweekly', 'monthly')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Savings Transactions table
  CREATE TABLE IF NOT EXISTS savings_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bucket_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    type TEXT CHECK(type IN ('deposit', 'withdrawal')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bucket_id) REFERENCES savings_buckets(id)
  );

  -- Repayments table
  CREATE TABLE IF NOT EXISTS repayments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    advance_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATETIME,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'overdue')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (advance_id) REFERENCES advances(id)
  );

  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_advances_user ON advances(user_id);
  CREATE INDEX IF NOT EXISTS idx_advances_status ON advances(status);
  CREATE INDEX IF NOT EXISTS idx_savings_user ON savings_buckets(user_id);
  CREATE INDEX IF NOT EXISTS idx_repayments_advance ON repayments(advance_id);
  CREATE INDEX IF NOT EXISTS idx_repayments_status ON repayments(status);
`);

// Insert default admin if not exists
const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
if (!adminExists) {
  // Use sync hash with bcryptjs
  const bcrypt = await import('bcryptjs');
  const hashedPassword = bcrypt.default.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES (?, ?, ?, ?)
  `).run('admin@edufund.ph', hashedPassword, 'System Admin', 'admin');
  console.log('Default admin created: admin@edufund.ph / admin123');
}

// Insert sample schools if none exist
const schoolsExist = db.prepare('SELECT COUNT(*) as count FROM schools').get();
if (schoolsExist.count === 0) {
  const sampleSchools = [
    ['University of the Philippines', '0x1234567890abcdef1234567890abcdef12345678', 1],
    ['Ateneo de Manila University', '0xabcdef1234567890abcdef1234567890abcdef12', 1],
    ['De La Salle University', '0x567890abcdef1234567890abcdef123456789012', 1],
    ['University of Santo Tomas', '0x90abcdef1234567890abcdef12345678901234ab', 1],
  ];
  const insertSchool = db.prepare('INSERT INTO schools (name, wallet_address, verified) VALUES (?, ?, ?)');
  sampleSchools.forEach(school => insertSchool.run(...school));
  console.log('Sample schools created');
}

export default db;
