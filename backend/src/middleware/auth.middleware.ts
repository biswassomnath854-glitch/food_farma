import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendError(res, 'Authentication token missing or invalid', 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return sendError(res, 'User no longer exists', 401);
    }

    if (user.status === 'BLOCKED') {
      return sendError(res, 'Your account has been blocked by administrator', 403);
    }

    req.user = user;
    next();
  } catch (error: any) {
    return sendError(res, 'Token expired or invalid', 401);
  }
};
