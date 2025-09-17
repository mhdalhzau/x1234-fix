import jwt from 'jsonwebtoken';
import crypto from 'crypto';
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET are required');
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}
export function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}
export function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
}
export function generateRandomToken() {
    return crypto.randomBytes(32).toString('hex');
}
