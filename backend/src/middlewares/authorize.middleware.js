import AppError from '../utils/appError.js';

/**
 * Middleware to authorize requests based on user accountType.
 * @param {string} allowedAccountType - The required accountType (e.g., 'org_member' or 'worker')
 */
export const authorize = (allowedAccountType) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized: You must be logged in to access this route.', 401));
    }

    if (req.user.accountType !== allowedAccountType) {
      return next(new AppError('Forbidden: You do not have permission to access this resource.', 403));
    }

    next();
  };
};

export default authorize;
