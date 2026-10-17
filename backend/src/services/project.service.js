import Project from '../models/project.model.js';
import AppError from '../utils/appError.js';
import { logAuditAction } from '../utils/auditLogger.js';
import { getPaginationOptions, getPaginationMetadata } from '../utils/paginate.js';
import { ProjectStatus } from '../enums/project.status.enum.js';

/**
 * Creates a project inside an organization tenant.
 * @param {Object} projectData - Project details (title, description, wage, trades, etc.)
 * @param {string} orgId - Tenant organization ID
 * @param {string} userId - User ID of creator
 * @returns {Promise<Object>} Created Project document
 */
export const createProject = async (projectData, orgId, userId) => {
  const project = await Project.create({
    ...projectData,
    orgId,
    createdBy: userId,
    status: ProjectStatus.OPEN
  });

  // Record Audit Log
  await logAuditAction({
    actorId: userId,
    orgId,
    action: 'PROJECT_CREATE',
    resourceType: 'Project',
    resourceId: project._id,
    metadata: { title: project.title }
  });

  return project;
};

/**
 * Lists projects strictly scoped to the active tenant.
 * @param {string} orgId - Tenant organization ID
 * @param {Object} filterParams - Filters (like status)
 * @param {Object} queryOptions - Pagination query (page, limit)
 * @returns {Promise<Object>} { projects, pagination }
 */
export const listTenantProjects = async (orgId, filterParams, queryOptions) => {
  const { page, limit, skip } = getPaginationOptions(queryOptions);

  const filter = { orgId };
  if (filterParams.status) {
    filter.status = filterParams.status;
  }

  const [totalItems, projects] = await Promise.all([
    Project.countDocuments(filter),
    Project.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
  ]);

  const pagination = getPaginationMetadata(totalItems, page, limit);

  return {
    projects,
    pagination
  };
};

/**
 * Public/global project discovery for workers to search open postings.
 * @param {Object} filterParams - Filter conditions (trade, location)
 * @param {Object} queryOptions - Pagination (page, limit)
 * @returns {Promise<Object>} { projects, pagination }
 */
export const discoverProjects = async (filterParams, queryOptions) => {
  const { page, limit, skip } = getPaginationOptions(queryOptions);

  // Workers should only search for OPEN projects
  const filter = { status: ProjectStatus.OPEN };

  if (filterParams.trade) {
    filter.requiredTrades = filterParams.trade;
  }

  if (filterParams.location) {
    filter.location = { $regex: filterParams.location, $options: 'i' };
  }

  const [totalItems, projects] = await Promise.all([
    Project.countDocuments(filter),
    Project.find(filter)
      .populate('orgId', 'name location')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
  ]);


};

/**
 * Retrieves a single project inside the organization.
 * @param {string} projectId - Project ID
 * @param {string} orgId - Tenant organization ID
 * @returns {Promise<Object>} Project document
 */
export const getProjectById = async (projectId, orgId) => {
  const project = await Project.findOne({ _id: projectId, orgId });
  if (!project) {
    throw new AppError('Project not found in this organization', 404);
  }
  return project;
};

/**
 * Updates project details inside the organization.
 * @param {string} projectId - Project ID
 * @param {string} orgId - Tenant organization ID
 * @param {Object} updateData - Key-values to update
 * @param {string} userId - User ID performing updates
 * @returns {Promise<Object>} Updated Project document
 */
export const updateProject = async (projectId, orgId, updateData, userId) => {
  // Enforce logical integrity on start/end dates
  if (updateData.startDate || updateData.endDate) {
    const existing = await Project.findOne({ _id: projectId, orgId });
    if (!existing) {
      throw new AppError('Project not found', 404);
    }
    const start = new Date(updateData.startDate || existing.startDate);
    const end = new Date(updateData.endDate || existing.endDate);
    if (end < start) {
      throw new AppError('End date must be on or after start date', 400);
    }
  }

  const project = await Project.findOneAndUpdate(
    { _id: projectId, orgId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!project) {
    throw new AppError('Project not found in this organization', 404);
  }

  // Record Audit Log
  await logAuditAction({
    actorId: userId,
    orgId,
    action: 'PROJECT_UPDATE',
    resourceType: 'Project',
    resourceId: project._id,
    metadata: { updatedFields: Object.keys(updateData) }
  });

  return project;
};

export default {
  createProject,
  listTenantProjects,
  discoverProjects,
  getProjectById,
  updateProject
};
