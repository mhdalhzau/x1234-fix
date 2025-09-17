import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../utils/jwt.js';
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function requireRole(roles: string[]): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare function requireOwner(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function requireSameTenant(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function requireTenantBound(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
