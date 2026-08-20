import AuditLog from '../models/audit-log.model.js';

/**
 * Utility function to write an action to the AuditLog database collection safely.
 * Any logging failures are caught and logged to prevent interrupting business logic.
 * 
 * @param {Object} logData
 * @param {string} logData.actorId - User performing the action
 * @param {string} [logData.orgId] - Associated tenant organization ID
 * @param {string} logData.action - Action string descriptor (e.g., 'PROJECT_CREATE')
 * @param {string} logData.resourceType - Type of resource mutated ('Project', 'Application', etc.)
 * @param {string} logData.resourceId - Mongoose ObjectId of the mutated resource
 * @param {Object} [logData.metadata] - Optional additional context metadata
 */
export const logAuditAction = async ({
  actorId,
  orgId,
  action,
  resourceType,
  resourceId,
  metadata = {}
}) => {
  try {
    await AuditLog.create({
      actorId,
      orgId,
      action,
      resourceType,
      resourceId,
      metadata
    });
  } catch (error) {
    console.error(`[Audit Logger Failure] Action '${action}' on resource '${resourceType}' (${resourceId}) could not be recorded:`, error);
  }
};

export default logAuditAction;
