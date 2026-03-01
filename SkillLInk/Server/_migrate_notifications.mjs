import pool from './Services/db.js';
try {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS notifications (" +
    "id UUID PRIMARY KEY DEFAULT gen_random_uuid()," +
    "user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE," +
    "type VARCHAR(50) NOT NULL," +
    "title VARCHAR(255) NOT NULL," +
    "message TEXT NOT NULL," +
    "related_id UUID," +
    "is_read BOOLEAN DEFAULT FALSE," +
    "created_at TIMESTAMP DEFAULT NOW())"
  );
  console.log('Created notifications table');

  await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read)');
  console.log('Created indexes');

  process.exit(0);
} catch(e) {
  console.error('Error:', e.message);
  process.exit(1);
}
