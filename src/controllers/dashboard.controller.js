import Record from '../models/Record.model.js';


export const getSummary = async (req, res) => {
  try {
   
    const summary = await Record.aggregate([
      {
        $match: { isDeleted: false }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

  
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    summary.forEach((item) => {
      if (item._id === 'income') {
        totalIncome = item.total;
        incomeCount = item.count;
      } else {
        totalExpense = item.total;
        expenseCount = item.count;
      }
    });

    return res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        incomeCount,
        expenseCount,
        totalRecords: incomeCount + expenseCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getCategoryTotals = async (req, res) => {
  try {
    const { type } = req.query; 

    const match = { isDeleted: false };
    if (type) match.type = type;

    const categories = await Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 } 
      },
      {
        $project: {
          _id: 0,
          category: '$_id.category',
          type: '$_id.type',
          total: 1,
          count: 1
        }
      }
    ]);

    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getMonthlyTrends = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const trends = await Record.aggregate([
      {
        $match: {
          isDeleted: false,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          type: '$_id.type',
          total: 1,
          count: 1
        }
      }
    ]);

    
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(year, i).toLocaleString('default', { month: 'long' }),
      income: 0,
      expense: 0,
    }));

    trends.forEach((item) => {
      const monthData = months[item.month - 1];
      if (item.type === 'income') {
        monthData.income = item.total;
      } else {
        monthData.expense = item.total;
      }
    });

   
    months.forEach((m) => {
      m.netBalance = m.income - m.expense;
    });

    return res.json({
      success: true,
      data: {
        year: Number(year),
        months,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const records = await Record.find({ isDeleted: false })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getWeeklyTrends = async (req, res) => {
  try {
   
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trends = await Record.aggregate([
      {
        $match: {
          isDeleted: false,
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          _id: 0,
          day: '$_id.day',
          month: '$_id.month',
          type: '$_id.type',
          total: 1,
          count: 1
        }
      }
    ]);

    return res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
