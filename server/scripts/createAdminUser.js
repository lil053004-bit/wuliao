import bcrypt from 'bcryptjs';
import db from '../database/sqlite.js';
import { randomUUID } from 'crypto';

const username = process.argv[2] || 'admin';
const password = process.argv[3] || 'admin123';

const existingUser = db.prepare(`
  SELECT * FROM admin_users WHERE username = ?
`).get(username);

if (existingUser) {
  console.log(`✅ Admin user "${username}" already exists`);
  process.exit(0);
}

const passwordHash = bcrypt.hashSync(password, 10);
const id = randomUUID();

db.prepare(`
  INSERT INTO admin_users (id, username, password_hash)
  VALUES (?, ?, ?)
`).run(id, username, passwordHash);

console.log(`✅ Admin user created successfully`);
console.log(`   Username: ${username}`);
console.log(`   Password: ${password}`);
console.log(`\n⚠️  Please change the default password after first login!`);
