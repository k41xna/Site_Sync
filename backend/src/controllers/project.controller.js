import * as projectService from '../services/project.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

/**
 * Handles creation of a project inside an organization tenant (Owner/Manager).
 */
export const create = asyncHandler(async (req, res, next) => {
  if (!req.orgId) {
    return next(new AppError('Organization context not established', 400));
  }

  const project = await projectService.createProject(req.body, req.orgId, req.user._id);

  res.status(201).json({
    status: 'success',
    data: {
      project
    }
  });
});

/**
 * Lists projects scoped strictly to the active contractor organization (Owner/Manager/Billing).
 */
export const listTenant = asyncHandler(async (req, res, next) => {
  if (!req.orgId) {
    return next(new AppError('Organization context not established', 400));
  }

  const result = await projectService.listTenantProjects(req.orgId, req.query, req.query);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

/**
 * Public project discovery listing (Open to workers searching for jobs globally).
 */
export const discover = asyncHandler(async (req, res) => {
  const result = await projectService.discoverProjects(req.query, req.query);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

/**
 * Retrieves details of a specific project inside the tenant.
 */
export const get = asyncHandler(async (req, res, next) => {
  if (!req.orgId) {
    return next(new AppError('Organization context not established', 400));
  }

  const project = await projectService.getProjectById(req.params.projectId, req.orgId);

  res.status(200).json({
    status: 'success',
    data: {
      project
    }
  });
});

/**
 * Updates details of a specific project inside the tenant (Owner/Manager).
 */
export const update = asyncHandler(async (req, res, next) => {
  if (!req.orgId) {
    return next(new AppError('Organization context not established', 400));
  }

  const project = await projectService.updateProject(
    req.params.projectId,
    req.orgId,
    req.body,
    req.user._id
  );

  res.status(200).json({
    status: 'success',
    message: 'Project updated successfully',
    data: {
      project
    }
  });
});

export default { create, listTenant, discover, get, update };
