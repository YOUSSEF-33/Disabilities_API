import jwt from "jsonwebtoken";

const JWT_SECRET:any = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

export const generateToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
