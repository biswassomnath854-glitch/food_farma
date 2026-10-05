import { Request, Response } from 'express';
import { User, RefreshToken, Cart } from '../models';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, 'User with this email already exists', 400);
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'USER';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: userRole,
      status: 'ACTIVE',
    });

    // Create an empty Cart for the user
    await Cart.create({ userId: user.id });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = user.toJSON();
    delete (userObj as any).password;

    return sendSuccess(res, 'Registration successful', {
      user: userObj,
      accessToken,
      refreshToken,
    }, 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Registration failed', 500, error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (user.status === 'BLOCKED') {
      return sendError(res, 'Your account has been blocked', 403);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = user.toJSON();
    delete (userObj as any).password;

    return sendSuccess(res, 'Login successful', {
      user: userObj,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    return sendError(res, error.message || 'Login failed', 500, error);
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      return sendError(res, 'Refresh token required', 400);
    }

    const decoded = verifyRefreshToken(refreshToken);
    const storedToken = await RefreshToken.findOne({ where: { token: refreshToken, userId: decoded.userId } });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || user.status === 'BLOCKED') {
      return sendError(res, 'User inactive or non-existent', 401);
    }

    const newAccessToken = generateAccessToken(user.id, user.role);
    return sendSuccess(res, 'Token refreshed successfully', { accessToken: newAccessToken });
  } catch (error: any) {
    return sendError(res, 'Invalid refresh token', 401, error);
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (refreshToken) {
      await RefreshToken.destroy({ where: { token: refreshToken } });
    }
    res.clearCookie('refreshToken');
    return sendSuccess(res, 'Logged out successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Logout failed', 500);
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }
    const userObj = req.user.toJSON();
    delete (userObj as any).password;
    return sendSuccess(res, 'User profile retrieved', userObj);
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch user', 500);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }
    const { name, email, phone } = req.body;

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return sendError(res, 'User with this email already exists', 400);
      }
      req.user.email = email;
    }

    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    await req.user.save();

    const userObj = req.user.toJSON();
    delete (userObj as any).password;

    return sendSuccess(res, 'Profile updated successfully', userObj);
  } catch (error: any) {
    return sendError(res, error.message || 'Profile update failed', 500);
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'User not authenticated', 401);
    }
    const { currentPassword, newPassword } = req.body;

    const isMatch = await comparePassword(currentPassword, req.user.password);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    const hashedPassword = await hashPassword(newPassword);
    req.user.password = hashedPassword;
    await req.user.save();

    return sendSuccess(res, 'Password changed successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to change password', 500);
  }
};

