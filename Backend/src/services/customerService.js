const { Customer, Order, sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class CustomerService {
    /**
     * Get Dashboard Stats
     */
    async getStats() {
        const totalCustomers = await Customer.count();
        const activeCustomers = await Customer.count({ where: { is_active: true, is_blocked: false } });
        const blockedCustomers = await Customer.count({ where: { is_blocked: true } });

        // Revenue calculation from Orders (sum of total_amount for non-cancelled orders)
        const revenueResult = await Order.sum('total_amount', {
            where: {
                status: { [Op.ne]: 'cancelled' }
            }
        });
        const totalRevenue = revenueResult || 0;

        return {
            totalCustomers,
            activeCustomers,
            blockedCustomers,
            totalRevenue
        };
    }

    /**
     * Create new customer or admin user
     */
    async createCustomer(data) {
        const { User, Customer, Offer } = require('../models');
        const role = data.role || 'customer';
        const TargetModel = role === 'customer' ? Customer : User;

        // Check for existing email in BOTH tables to be safe
        const existingInUser = await User.findOne({ where: { email: data.email } });
        const existingInCust = await Customer.findOne({ where: { email: data.email } });
        if (existingInUser || existingInCust) {
            throw new Error('Email already registered');
        }

        // Check for existing phone if provided
        if (data.phone) {
            const phoneInUser = await User.findOne({ where: { phone: data.phone } });
            const phoneInCust = await Customer.findOne({ where: { phone: data.phone } });
            if (phoneInUser || phoneInCust) {
                throw new Error('Phone number already registered');
            }
        }

        const createData = {
            ...data,
            house_address: data.address,
            is_active: true,
            is_blocked: data.is_blocked || false,
            last_activity: new Date()
        };

        // Sanitize for User model (Admin/Staff)
        if (role !== 'customer') {
            const adminData = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                role: data.role,
                is_blocked: data.is_blocked || false,
                last_activity: new Date()
            };
            
            // Password handling
            const bcrypt = require('bcryptjs');
            const passwordToHash = data.password || 'admin123';
            adminData.password_hash = await bcrypt.hash(passwordToHash, 10);
            
            const newUser = await User.create(adminData);
            return newUser;
        }

        // For CUSTOMERS
        if (data.password) {
            const bcrypt = require('bcryptjs');
            createData.password_hash = await bcrypt.hash(data.password, 10);
        }

        const newUser = await Customer.create(createData);

        // Only assign welcome offer to customers
        if (role === 'customer') {
          try {
              let offer = await Offer.findOne({ where: { code: 'WELCOME30' } });
              if (!offer) {
                  offer = await Offer.create({
                      code: 'WELCOME30',
                      discount_type: 'percentage',
                      discount_value: 30,
                      valid_from: new Date(),
                      valid_to: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                      is_active: true,
                      applicable_to: 'specific',
                      specific_users: [newUser.id]
                  });
              } else if (offer.applicable_to === 'specific') {
                  const specificUsers = offer.specific_users || [];
                  if (!specificUsers.includes(newUser.id)) {
                      await offer.update({ specific_users: [...specificUsers, newUser.id] });
                  }
              }
          } catch (err) {
              console.error('Failed to assign WELCOME30 offer:', err);
          }
        }

        return newUser;
    }

    /**
     * List customers and admin users with pagination, filtering, searching, sorting
     */
    async listCustomers(query) {
        const { User, Customer } = require('../models');
        const {
            page = 1,
            limit = 10,
            search,
            status,
            role,
            sort = 'created_at',
            order = 'DESC'
        } = query;

        const parsedLimit = parseInt(limit) || 10;
        const parsedPage = parseInt(page) || 1;
        const offset = (parsedPage - 1) * parsedLimit;
        
        const isAllRole = !role || role === 'all';
        const isAllStatus = !status || status === 'all';

        // 1. Fetch matching Users (admins/staff)
        let users = [];
        if (isAllRole || role === 'admin' || role === 'staff' || role === 'superadmin') {
            const userWhere = {};
            if (search) {
                userWhere[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { phone: { [Op.like]: `%${search}%` } }
                ];
            }
            if (!isAllRole) {
                userWhere.role = role;
            }
            
            users = await User.findAll({ where: userWhere });
        }

        // 2. Fetch Customers
        let customers = [];
        if (isAllRole || role === 'customer') {
            const customerWhere = {};
            if (search) {
                customerWhere[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { phone: { [Op.like]: `%${search}%` } }
                ];
            }

            if (!isAllStatus) {
                if (status === 'active') {
                    customerWhere.is_blocked = false;
                } else if (status === 'blocked') {
                    customerWhere.is_blocked = true;
                }
            }

            // Using standard sequelize attributes where possible, but mapping virtuals for the merge
            customers = await Customer.findAll({
                where: customerWhere,
                include: [
                    { 
                        model: Order, 
                        as: 'orders',
                        attributes: ['id', 'total_amount', 'status'],
                        required: false
                    }
                ]
            });
        }

        // 3. Merge and Normalize with unified structure
        const adminUsers = users.map(u => {
            const data = u.toJSON();
            return {
                ...data,
                role: data.role || 'admin',
                orders_count: 0,
                total_spent: 0,
                is_customer: false
            };
        });

        const customerUsers = customers.map(c => {
            const data = c.toJSON();
            // Calculate aggregates from the included orders
            const validOrders = (data.orders || []).filter(o => o.status !== 'cancelled');
            return {
                ...data,
                role: 'customer',
                orders_count: (data.orders || []).length,
                total_spent: validOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
                is_customer: true
            };
        });

        let allUsersNormalized = [...adminUsers, ...customerUsers];

        // 4. Apply general status filter to merged list for non-customer users 
        // (Customer table handled by where clause, but for consistency we check here too)
        if (!isAllStatus) {
            if (status === 'active') {
                allUsersNormalized = allUsersNormalized.filter(u => u.is_blocked === false || u.is_blocked === null || u.is_blocked === undefined);
            } else if (status === 'blocked') {
                allUsersNormalized = allUsersNormalized.filter(u => u.is_blocked === true);
            }
        }

        // 5. Sort
        allUsersNormalized.sort((a, b) => {
            let valA, valB;

            if (sort === 'orders' || sort === 'orders_count') {
                valA = a.orders_count || 0;
                valB = b.orders_count || 0;
            } else if (sort === 'spending' || sort === 'total_spent') {
                valA = a.total_spent || 0;
                valB = b.total_spent || 0;
            } else if (sort === 'created_at' || sort === 'createdAt') {
                valA = new Date(a.created_at || a.createdAt || 0).getTime();
                valB = new Date(b.created_at || b.createdAt || 0).getTime();
            } else {
                valA = (a[sort] || '').toString().toLowerCase();
                valB = (b[sort] || '').toString().toLowerCase();
            }

            if (order.toUpperCase() === 'DESC') {
                return valA < valB ? 1 : -1;
            } else {
                return valA > valB ? 1 : -1;
            }
        });

        // 6. Paginate
        const total = allUsersNormalized.length;
        const pagedData = allUsersNormalized.slice(offset, offset + parsedLimit);

        return {
            total,
            pages: Math.ceil(total / parsedLimit),
            currentPage: parsedPage,
            data: pagedData
        };
    }

    /**
     * Get Customer Details
     */
    async getCustomerDetails(id) {
        const customer = await Customer.findByPk(id);
        if (!customer) throw new Error('Customer not found');

        // Get Orders
        const orders = await Order.findAll({
            where: { customer_id: id },
            order: [['createdAt', 'DESC']]
        });

        // Calculate stats
        const totalSpent = orders.reduce((sum, ord) => {
            return ord.status !== 'cancelled' ? sum + parseFloat(ord.total_amount) : sum;
        }, 0);

        return {
            ...customer.toJSON(),
            orders,
            stats: {
                total_spent: totalSpent,
                total_orders: orders.length
            }
        };
    }

    /**
     * Update Customer or User Status (Block/Unblock)
     */
    async updateStatus(id, isBlocked, reason, actorId) {
        const { User, Customer } = require('../models');
        
        let userInstance = await Customer.findByPk(id);
        if (!userInstance) {
            userInstance = await User.findByPk(id);
        }

        if (!userInstance) throw new Error('User not found');

        userInstance.is_blocked = isBlocked;
        await userInstance.save();
        return userInstance;
    }

    /**
     * Update Customer or Admin Details
     */
    async updateCustomer(id, data) {
        const { User, Customer } = require('../models');
        
        let userInstance = await Customer.findByPk(id);
        let Model = Customer;
        
        if (!userInstance) {
            userInstance = await User.findByPk(id);
            Model = User;
        }

        if (!userInstance) throw new Error('User not found');

        // Safe fields that can be updated
        const allowedFields = ['name', 'email', 'phone', 'address', 'is_blocked', 'is_active', 'role'];
        const filteredData = {};

        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                filteredData[field] = data[field];
            }
        });

        // Check for duplicate email if changing
        if (filteredData.email && filteredData.email !== userInstance.email) {
            const inUser = await User.findOne({ where: { email: filteredData.email } });
            const inCust = await Customer.findOne({ where: { email: filteredData.email } });
            if (inUser || inCust) throw new Error('Email already registered');
        }

        // Check for duplicate phone if changing
        if (filteredData.phone && filteredData.phone !== userInstance.phone) {
            const inUser = await User.findOne({ where: { phone: filteredData.phone } });
            const inCust = await Customer.findOne({ where: { phone: filteredData.phone } });
            if (inUser || inCust) throw new Error('Phone number already registered');
        }

        await userInstance.update(filteredData);
        return userInstance;
    }

    /**
     * Export Customers (Helper)
     */
    async getAllCustomersForExport(filters) {
        // Reuse listCustomers logic but without pagination limit
        const result = await this.listCustomers({ ...filters, limit: 100000 });
        return result.data;
    }

    async sendNotification(data) {
        const { customers: customerIds, type, message, subject, image_data, attachment_data, attachment_name, baseUrl } = data;

        try {
            const customers = await Customer.findAll({
                where: { id: { [Op.in]: customerIds } }
            });

            if (type === 'email') {
                const emailService = require('./emailService');
                const results = [];

                for (const customer of customers) {
                    if (customer.email) {
                        const attachments = [];
                        if (attachment_data) {
                            const matches = attachment_data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                            attachments.push({
                                filename: attachment_name || 'attachment',
                                content: matches ? Buffer.from(matches[2], 'base64') : Buffer.from(attachment_data, 'base64'),
                                contentType: matches ? matches[1] : 'application/octet-stream'
                            });
                        }

                        const status = await emailService.sendEmail({
                            to: customer.email,
                            subject: subject || 'Notification',
                            html: `<div style="font-family: sans-serif;">${message.replace(/\n/g, '<br>')}</div>`,
                            attachments
                        });
                        results.push({ email: customer.email, status });
                    }
                }

                logAudit('SEND_EMAIL_NOTIFICATION', {
                    recipientCount: customers.length,
                    successCount: results.filter(r => r.status).length
                });

                return {
                    success: true,
                    sent_count: results.filter(r => r.status).length,
                    results
                };
            } else if (type === 'whatsapp') {
                let finalMessage = message;
                let uploadedImageUrl = null;

                if (image_data) {
                    try {
                        const fileName = await this._saveBase64File(image_data, 'whatsapp_image');
                        uploadedImageUrl = `${baseUrl}/uploads/notifications/${fileName}`;
                        finalMessage = `${uploadedImageUrl}\n\n${message}`;
                    } catch (err) {
                        console.error('Failed to save whatsapp image:', err);
                    }
                }

                logAudit('SEND_WHATSAPP_NOTIFICATION', {
                    recipientCount: customers.length,
                    hasImage: !!image_data,
                    imageUrl: uploadedImageUrl
                });

                return {
                    success: true,
                    sent_count: customers.length,
                    message: 'WhatsApp notification prepared.',
                    imageUrl: uploadedImageUrl,
                    finalMessage: finalMessage
                };
            }

            return { success: false, message: 'Unsupported notification type' };
        } catch (error) {
            console.error('Error in sendNotification:', error);
            throw error;
        }
    }

    /**
     * Helper to save base64 to file
     */
    async _saveBase64File(base64Data, prefix = 'file') {
        try {
            const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                throw new Error('Invalid base64 string');
            }

            const type = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const extension = type.split('/')[1] || 'bin';
            const fileName = `${prefix}_${uuidv4()}.${extension}`;

            const uploadDir = path.join(__dirname, '../../uploads/notifications');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);

            return fileName;
        } catch (error) {
            console.error('File save error:', error);
            throw error;
        }
    }
}

const logAudit = (action, details) => {
    console.log(`[AUDIT] Action: ${action} | Details: ${JSON.stringify(details)}`);
};

module.exports = new CustomerService();
