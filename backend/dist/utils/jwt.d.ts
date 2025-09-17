export interface JwtPayload {
    userId: string;
    tenantId: string | null;
    role: string;
    email: string;
}
export declare function generateAccessToken(payload: JwtPayload): string;
export declare function generateRefreshToken(payload: JwtPayload): string;
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function verifyRefreshToken(token: string): JwtPayload;
export declare function generateRandomToken(): string;
