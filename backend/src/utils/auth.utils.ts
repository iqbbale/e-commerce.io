import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './jwt.utils';
import { sendSuccess, sendError } from './response.utils';
import { AuthRequest } from '../middleware/auth.middleware';

// Helper: build user response object
const buildUserResponse = (user: IUser) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || '',
  phone: user.phone || '',
  isActive: user.isActive,
});

// ===== REGISTER =====
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Cek email duplikat
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      sendError(res, 'Email sudah terdaftar', 409);
      return;
    }

    // 2. Hash password SEKALI di sini (tidak ada pre-save hook)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Simpan user dengan password sudah di-hash
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone?.trim() || '',
      role: 'customer',
      isActive: true,
      isEmailVerified: false,
    });

    // 4. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 5. Simpan refreshToken (updateOne: tidak trigger apapun)
    await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

    console.log(`[REGISTER] ✅ ${cleanEmail} registered successfully`);

    sendSuccess(
      res,
      { user: buildUserResponse(user), accessToken, refreshToken },
      'Registrasi berhasil',
      201
    );
  } catch (error: unknown) {
    const mongoError = error as { code?: number; message?: string };
    console.error('[REGISTER] Error:', mongoError.message);
    // Handle MongoDB duplicate key error
    if (mongoError.code === 11000) {
      sendError(res, 'Email sudah terdaftar', 409);
      return;
    }
    sendError(res, 'Registrasi gagal, silakan coba lagi', 500);
  }
};

// ===== LOGIN =====
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Cari user + ambil password field
    const user = await User.findOne({ email: cleanEmail }).select('+password +refreshToken');

    if (!user) {
      console.log(`[LOGIN] User not found: ${cleanEmail}`);
      sendError(res, 'Email atau password salah', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'Akun dinonaktifkan. Hubungi support.', 403);
      return;
    }

    // 2. Verifikasi password langsung dengan bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[LOGIN] ${cleanEmail} - password match: ${isMatch}`);

    if (!isMatch) {
      sendError(res, 'Email atau password salah', 401);
      return;
    }

    // 3. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 4. Update refreshToken
    await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

    console.log(`[LOGIN] ✅ ${cleanEmail} (${user.role}) logged in`);

    sendSuccess(
      res,
      { user: buildUserResponse(user), accessToken, refreshToken },
      'Login berhasil'
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('[LOGIN] Error:', err.message);
    sendError(res, 'Login gagal, silakan coba lagi', 500);
  }
};

// ===== LOGOUT =====
export const logoutUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await User.updateOne({ _id: req.user.id }, { $set: { refreshToken: null } });
    }
    sendSuccess(res, null, 'Logout berhasil');
  } catch {
    sendError(res, 'Logout gagal', 500);
  }
};

// ===== REFRESH TOKEN =====
export const refreshTokenAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) { sendError(res, 'Refresh token diperlukan', 401); return; }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      sendError(res, 'Refresh token tidak valid', 401);
      return;
    }

    const accessToken = generateAccessToken(user as IUser);
    const newRefreshToken = generateRefreshToken(user as IUser);
    await User.updateOne({ _id: user._id }, { $set: { refreshToken: newRefreshToken } });

    sendSuccess(res, { accessToken, refreshToken: newRefreshToken }, 'Token diperbarui');
  } catch {
    sendError(res, 'Token tidak valid atau kadaluarsa', 401);
  }
};

// ===== GET ME =====
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).populate('wishlist', 'name price images slug');
    if (!user) { sendError(res, 'User tidak ditemukan', 404); return; }
    sendSuccess(res, user);
  } catch {
    sendError(res, 'Gagal mengambil data user', 500);
  }
};
