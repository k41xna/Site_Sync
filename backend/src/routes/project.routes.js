import express from 'express';
import * as projectController from '../controllers/project.controller.js';
import authenticate from '../middlewares/authenticate.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';
import establishOrgContext from '../middlewares/tenant.middleware.js';
import requirePermission from '../middlewares/permission.middleware.js';
import { Permissions } from '../enums/permissions.enum.js';
import { createProjectSchema, updateProjectSchema } from '../validation/project.validation.js';
import validate from '../middlewares/validation.middleware.js';

const router = express.Router();

// Authenticate all project requests
router.use(authenticate);

// 1. Job Discovery endpoint (restricted to worker accounts)
router.get('/discover', authorize('worker'), projectController.discover);

// 2. Tenant-scoped project endpoints (restricted to contractor org_member accounts)
router.use(authorize('org_member'));
router.use(establishOrgContext);

router.post(
  '/',
  requirePermission(Permissions.MANAGE_PROJECTS),
  validate(createProjectSchema),
  projectController.create
);

router.get('/', projectController.listTenant);

router.get('/:projectId', projectController.get);

router.patch(
  '/:projectId',
  requirePermission(Permissions.MANAGE_PROJECTS),
  validate(updateProjectSchema),
  projectController.update
);

export default router;
