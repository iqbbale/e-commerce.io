import jwt from 'jsonwebtoken';
import { IUser } from '../models/User.model';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

const getSecret = (key: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string => {
  const val = process.env[key];
  if (!val) throw new Error(`${key} is not defined in environment variables`);
  return val;
};

export const generateAccessToken = (user: IUser): string => {
  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, getSecret('JWT_SECRET'), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

export const generateRefreshToken = (user: IUser): string => {
  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, getSecret('JWT_REFRESH_SECRET'), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, getSecret('JWT_SECRET')) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, getSecret('JWT_REFRESH_SECRET')) as TokenPayload;
};
