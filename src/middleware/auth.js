import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const authenticate = async (req, res, next) => {
  try {
    // Token lo header se
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User DB mein hai aur active hai?
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.status === 'inactive') {
      return res.status(401).json({
        success: false,
        message: 'User not found or account inactive.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

export default authenticate;