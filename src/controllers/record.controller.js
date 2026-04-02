import Record from '../models/Record.model.js';
import { z } from 'zod';

// ─── VALIDATION SCHEMA ───────────────────────────────────
const recordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().optional(),
  notes: z.string().max(500).optional(),
});

const updateRecordSchema = recordSchema.partial();

// ─── CREATE RECORD — Admin only ──────────────────────────
export const createRecord = async (req, res) => {
  try {
    const result = recordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
    }

    const record = await Record.create({
      ...result.data,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Record created successfully.',
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── GET ALL RECORDS — All roles ─────────────────────────
export const getAllRecords = async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    // ✅ IMPORTANT: soft delete filter
    const filter = { isDeleted: false };

    if (type) filter.type = type;

    if (category) {
      filter.category = category.toLowerCase();
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Record.find(filter)
        .populate('createdBy', 'name email')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      Record.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: {
        records,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── GET SINGLE RECORD — All roles ───────────────────────
export const getRecordById = async (req, res) => {
  try {
    const record = await Record.findOne({
      _id: req.params.id,
      isDeleted: false, // ✅ yaha bhi filter
    })
      .populate('createdBy', 'name email')
      .lean();

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }

    return res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── UPDATE RECORD — Admin only ──────────────────────────
export const updateRecord = async (req, res) => {
  try {
    const result = updateRecordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
    }

    const record = await Record.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false, // ✅ deleted record update nahi hoga
      },
      {
        ...result.data,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Record updated successfully.',
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── DELETE RECORD — Admin only (soft delete) ────────────
export const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false, // ✅ already deleted ko dubara delete nahi karega
      },
      {
        isDeleted: true,
      },
      {
        new: true,
      }
    ).lean();

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found or already deleted.',
      });
    }

    return res.json({
      success: true,
      message: 'Record deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};