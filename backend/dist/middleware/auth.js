import { verifyAccessToken } from '../utils/jwt.js';
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access token is required' });
    }
    const token = authHeader.substring(7);
    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}
export function requireRole(roles) {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!roles.includes(authReq.user.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
}
export function requireOwner(req, res, next) {
    const authReq = req;
    if (!authReq.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    if (authReq.user.role !== 'owner') {
        return res.status(403).json({ message: 'Owner access required' });
    }
    next();
}
export function requireSameTenant(req, res, next) {
    const authReq = req;
    if (!authReq.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    const tenantId = req.params.tenantId || req.body.tenantId;
    if (tenantId && tenantId !== authReq.user.tenantId) {
        return res.status(403).json({ message: 'Access denied to different tenant' });
    }
    next();
}
// Require tenant-bound user (not admin)
export function requireTenantBound(req, res, next) {
    const authReq = req;
    if (!authReq.user || !authReq.user.tenantId) {
        return res.status(403).json({ message: 'Access denied: tenant required' });
    }
    next();
}
