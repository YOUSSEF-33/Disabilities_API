import { verifyToken } from "@/utils/jwt";
import type { NextFunction, Request, Response } from "express";

export const authMiddleware = (req: Request, res:Response, next:NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token:any = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // attach user to request
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const adminMiddleware = (req: Request, res:Response, next:NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};