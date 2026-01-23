import bcrypt from 'bcryptjs';
import pool from './Services/db.js';

async function updateAdminPassword() {
    try {
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);
        
        console.log('Generated hash:', hash);
        
        const result = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email, role',
            [hash, 'admin@skilllink.com']
        );
        
        if (result.rows.length > 0) {
            console.log('✓ Admin password updated successfully');
            console.log('Email:', result.rows[0].email);
            console.log('Role:', result.rows[0].role);
            console.log('\nAdmin Credentials:');
            console.log('Email: admin@skilllink.com');
            console.log('Password: admin123');
        } else {
            console.log('✗ Admin user not found');
        }
        
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Error updating admin password:', error);
        process.exit(1);
    }
}

updateAdminPassword();
