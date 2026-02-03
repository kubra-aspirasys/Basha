const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user not found'
            });
        }

        // Admin override: Admins can access everything unless strictly restricted (logic here depends on rqmt, but usually admin has all access)
        // However, requirements asked for specific role separation. 
        // We will check if the user's role is in the allowed roles list.

        // Note: Customer model doesn't have a 'role' field by default based on my read, 
        // but authMiddleware might attach one or we need to infer it. 
        // Looking at authMiddleware.js:
        // Admin: req.user.role === 'admin'
        // Customer: fetched from Customer model. 

        // I will assume for now we can rely on `req.user.role` being 'admin' for admins.
        // For customers, if `req.user` exists and IS NOT admin, we treat as customer, 
        // OR we explicitly attach 'customer' role in authMiddleware (which I might need to tweak if it doesn't).

        // Let's deduce role from req.user
        const userRole = req.user.role || 'customer'; // Default to customer if role not present (safe assumption given separate tables?)

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `User role '${userRole}' is not authorized to access this route`
            });
        }

        next();
    };
};

module.exports = { authorize };
