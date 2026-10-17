import OrgMember from '../models/org-member.model.js';
import AppError from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Middleware to establish the organization context (multi-tenant boundary).
 * Extracts organization ID, validates membership of the logged-in user, 
 * and attaches orgId and the user's role in that organization to the request.
 */
export const establishOrgContext = asyncHandler(async (req, res, next) => {
  const orgId = req.headers['x-org-id'] || req.query.orgId || req.body.orgId;

  if (!orgId) {
    // If no org ID is provided, continue. Handlers requiring context will check for req.orgId.
    return next();
  }

  if (!req.user) {
    return next(new AppError('Unauthorized: Authentication is required to establish organization context.', 401));
  }

  // Find matching membership
  const membership = await OrgMember.findOne({
    userId: req.user._id,
    orgId
  });

  if (!membership) {
    return next(new AppError('Forbidden: You are not a member of this organization.', 403));
  }

  // Bind tenant attributes to request context
  req.orgId = membership.orgId; // mongoose ObjectId
  req.orgRole = membership.role; // e.g. OWNER, SITE_MANAGER, BILLING

  next();
});

export default establishOrgContext;
