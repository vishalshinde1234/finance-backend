import User from '../models/User.model.js';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['viewer', 'analyst', 'admin']).optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(['viewer', 'analyst', 'admin']),
});

const updateStatusSchema = z.object({
  status: z.enum(['active', 'inactive']),
});

// ─── GET ALL USERS ───────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE USER ─────────────────────────────────────
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CREATE USER ─────────────────────────────────────────
export const createUser = async (req, res) => {
  try {
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { name, email, password, role = 'viewer' } = result.data;

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    const user = await User.create({ name, email, password, role });

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE ROLE ──────────────────────────────────────────
export const updateUserRole = async (req, res) => {
  try {
    const result = updateRoleSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: result.data.role },
      { new: true }
    ).select('-password').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Role updated successfully.',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE STATUS ────────────────────────────────────────
export const updateUserStatus = async (req, res) => {
  try {
    const result = updateStatusSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: result.data.status },
      { new: true }
    ).select('-password').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.json({
      success: true,
      message: `User ${result.data.status === 'active' ? 'activated' : 'deactivated'} successfully.`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};