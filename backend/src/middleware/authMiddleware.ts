import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export interface AuthPayload {
  sub: number;
  role: "OWNER" | "MANAGER" | "STAFF";
  iat?: number;
  exp?: number;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = authHeader.substring("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    // Attach to request for downstream handlers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = {
      id: payload.sub,
      role: payload.role,
    };
    return next();
  } catch (err) {
    console.error("JWT verification failed", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(...roles: AuthPayload["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user as { id: number; role: AuthPayload["role"] } | undefined;

    if (!user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

