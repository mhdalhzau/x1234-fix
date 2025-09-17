import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(authReq.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}

// Role hierarchy: superadmin > tenant_owner > admin > staff
const ROLE_HIERARCHY = {
  superadmin: 4,
  tenant_owner: 3,
  admin: 2,
  staff: 1
};

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (authReq.user.role !== 'tenant_owner') {
    return res.status(403).json({ message: 'Tenant owner access required' });
  }

  next();
}

// Check if user has superadmin privileges
export function requireSuperadmin(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (authReq.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin access required' });
  }

  next();
}

// Check if user has at least the specified role level
export function requireMinimumRole(minimumRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRoleLevel = ROLE_HIERARCHY[authReq.user.role as keyof typeof ROLE_HIERARCHY] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[minimumRole as keyof typeof ROLE_HIERARCHY] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${minimumRole} or higher` 
      });
    }

    next();
  };
}

// Check if user can access tenant data (either superadmin or belongs to tenant)
export function canAccessTenant(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Superadmin can access any tenant
  if (authReq.user.role === 'superadmin') {
    return next();
  }

  // Others must belong to the same tenant
  const tenantId = req.params.tenantId || req.body.tenantId;
  if (tenantId && tenantId !== authReq.user.tenantId) {
    return res.status(403).json({ message: 'Access denied to different tenant' });
  }

  next();
}

export function requireSameTenant(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
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
export function requireTenantBound(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user || !authReq.user.tenantId) {
    return res.status(403).json({ message: 'Access denied: tenant required' });
  }
  next();
}