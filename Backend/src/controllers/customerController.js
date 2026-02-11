const customerService = require('../services/customerService');
const { createCustomerSchema, updateStatusSchema, sendNotificationSchema } = require('../validators/customerValidator');

class CustomerController {
    /**
     * Get Dashboard Stats
     */
    async getStats(req, res) {
        try {
            const stats = await customerService.getStats();
            res.status(200).json({
                success: true,
                message: 'Customer stats retrieved successfully',
                data: stats
            });
        } catch (error) {
            console.error('Error in getStats:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Server Error'
            });
        }
    }

    /**
     * Create Customer
     */
    async createCustomer(req, res) {
        try {
            const { error, value } = createCustomerSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const customer = await customerService.createCustomer(value);
            res.status(201).json({
                success: true,
                message: 'Customer created successfully',
                data: customer
            });
        } catch (error) {
            console.error('Error in createCustomer:', error);
            res.status(400).json({ // 400 likely for duplicate email/phone
                success: false,
                message: error.message || 'Error creating customer'
            });
        }
    }

    /**
     * List Customers
     */
    async listCustomers(req, res) {
        try {
            const queries = req.query;
            const result = await customerService.listCustomers(queries);
            res.status(200).json({
                success: true,
                message: 'Customers retrieved successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in listCustomers:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Server Error'
            });
        }
    }

    /**
     * Get Customer Details
     */
    async getCustomerDetails(req, res) {
        try {
            const { id } = req.params;
            const customer = await customerService.getCustomerDetails(id);
            res.status(200).json({
                success: true,
                message: 'Customer details retrieved successfully',
                data: customer
            });
        } catch (error) {
            console.error('Error in getCustomerDetails:', error);
            res.status(404).json({
                success: false,
                message: error.message || 'Customer not found'
            });
        }
    }

    /**
     * Update Status
     */
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { error, value } = updateStatusSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const customer = await customerService.updateStatus(id, value.is_blocked, value.reason, req.user.userId);
            res.status(200).json({
                success: true,
                message: `Customer ${value.is_blocked ? 'blocked' : 'unblocked'} successfully`,
                data: customer
            });
        } catch (error) {
            console.error('Error in updateStatus:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Server Error'
            });
        }
    }

    /**
     * Export Customers
     */
    async exportCustomers(req, res) {
        try {
            const { json2csv } = require('json2csv'); // Ensure this dependency exists or use a simpler mapper
            const customers = await customerService.getAllCustomersForExport(req.query);

            // Map flat structure for CSV
            const csvData = customers.map(c => ({
                Name: c.name,
                Email: c.email,
                Phone: c.phone || 'N/A',
                Address: c.address || 'N/A',
                Status: c.is_blocked ? 'Blocked' : 'Active',
                Joined: new Date(c.created_at).toLocaleDateString(),
                'Total Spent': c.total_spent,
                'Total Orders': c.orders_count
            }));

            // If json2csv is not available in package.json (I saw it was), we use it.
            // But let's verify if 'json2csv' exports a Parser class or similar if newer version.
            // package.json said "json2csv": "^6.0.0-alpha.2".
            // In v6, it might be { Parser } from 'json2csv'. Let's try basic require first, 
            // if it fails I'll implement a manual CSV builder to be safe and robust.

            // Manual CSV generation for reliability without checking documentation for specific alpha version quirks
            const fields = ['Name', 'Email', 'Phone', 'Address', 'Status', 'Joined', 'Total Spent', 'Total Orders'];
            const header = fields.join(',') + '\n';
            const rows = csvData.map(row =>
                fields.map(field => {
                    const val = row[field] === null || row[field] === undefined ? '' : String(row[field]);
                    // Escape quotes and wrap in quotes
                    return `"${val.replace(/"/g, '""')}"`;
                }).join(',')
            ).join('\n');

            const csv = header + rows;

            res.header('Content-Type', 'text/csv');
            res.attachment('customers.csv');
            res.send(csv);

        } catch (error) {
            console.error('Error in exportCustomers:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Export failed'
            });
        }
    }

    /**
     * Send Notification
     */
    async sendNotification(req, res) {
        try {
            const { error, value } = sendNotificationSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const result = await customerService.sendNotification({ ...value, baseUrl });
            res.status(200).json({
                success: true,
                message: 'Notifications queued successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in sendNotification:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to send notifications'
            });
        }
    }
}

module.exports = new CustomerController();
