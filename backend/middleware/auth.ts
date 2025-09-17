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

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (authReq.user.role !== 'owner') {
    return res.status(403).json({ message: 'Owner access required' });
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