const dashboardService = require('../services/dashboardService');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
    try {
        const { filter } = req.query;
        const stats = await dashboardService.getStats(filter);

        res.status(200).json({
            success: true,
            message: 'Dashboard stats retrieved successfully',
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats
};
