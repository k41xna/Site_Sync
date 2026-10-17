import AppError from '../utils/appError.js';

export const authenticate = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return next(new AppError('Unauthorized: You are not logged in. Please log in to gain access.', 401));
};

export default authenticate;
