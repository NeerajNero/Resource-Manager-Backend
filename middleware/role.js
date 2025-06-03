// backend/middleware/role.js

/**
 * authorize(...allowedRoles)
 * Returns middleware that ensures the authenticated user’s role
 * is one of allowedRoles. If not, responds with 403 Forbidden.
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // `req.user` must already have been set by protect() (JWT middleware)
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    // If the user’s role isn’t in the allowedRoles array, deny access
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role." });
    }

    // Otherwise, role is allowed—continue to the next middleware/controller
    next();
  };
};
