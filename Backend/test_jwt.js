const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const secret = process.env.JWT_SECRET || 'basha_biryani_secret_key_2024';
console.log('Using Secret:', secret);

const payload = { userId: 'test-id', role: 'admin' };
const token = jwt.sign(payload, secret, { expiresIn: '24h' });
console.log('Generated Token:', token);

try {
    const decoded = jwt.verify(token, secret);
    console.log('✅ Verification Successful:', decoded);
} catch (error) {
    console.error('❌ Verification Failed:', error.message);
}

// simulate the failure if secret was different
const wrongSecret = 'different_secret';
try {
    jwt.verify(token, wrongSecret);
} catch (error) {
    console.log('ℹ️ Verification with wrong secret failed as expected:', error.message);
}
