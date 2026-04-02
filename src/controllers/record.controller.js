import Record from '../models/Record.model.js';
import { z } from 'zod';


const recordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().optional(),
  notes: z.string().max(500).optional(),
});

const updateRecordSchema = recordSchema.partial();


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

  
    const filter = { isDeleted: false };

    if (type) filter.type = type;

    if (category) {
      filter.category = category.toLowerCase();
    }

  
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


export const getRecordById = async (req, res) => {
  try {
    const record = await Record.findOne({
      _id: req.params.id,
      isDeleted: false, 
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
        isDeleted: false, 
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


export const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false, 
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
