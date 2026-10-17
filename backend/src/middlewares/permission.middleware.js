import AppError from '../utils/appError.js';
import { Roles } from '../enums/role.enum.js';
import { Permissions } from '../enums/permissions.enum.js';

// Single source of truth for Role -> Permissions mapping
const rolePermissions = {
  [Roles.OWNER]: Object.values(Permissions), // OWNER has access to all actions
  [Roles.SITE_MANAGER]: [
    Permissions.MANAGE_PROJECTS,
    Permissions.MANAGE_WORKERS,
    Permissions.MANAGE_APPLICATIONS,
    Permissions.MANAGE_SHIFTS
  ],
  [Roles.BILLING]: [
    Permissions.VIEW_ANALYTICS,
    Permissions.MANAGE_PAYROLL,
    Permissions.VIEW_AUDIT_LOGS
  ]
};

/**
 * Middleware factory to check if the current user has the required permission in the active tenant.
 * @param {string} requiredPermission - The permission key to validate (from permissions.enum.js)
 */
export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized: Authentication required.', 401));
    }

    if (!req.orgId || !req.orgRole) {
      return next(new AppError('Forbidden: Organization context not established.', 403));
    }

    const permissions = rolePermissions[req.orgRole] || [];

    if (!permissions.includes(requiredPermission)) {
      return next(new AppError('Forbidden: You do not have permission to access this resource.', 403));
    }

    next();
  };
};

export default requirePermission;
