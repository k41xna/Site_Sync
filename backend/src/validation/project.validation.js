import { z } from 'zod';
import { Trades } from '../enums/trade.enum.js';
import { ProjectStatus } from '../enums/project.status.enum.js';

// Safe date validator supporting both YYYY-MM-DD and full ISO strings
const dateValidator = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Must be a valid date format'
});

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Project title is required'
    }).min(3, 'Title must be at least 3 characters').trim(),
    description: z.string().optional().default(''),
    location: z.string({
      required_error: 'Location is required'
    }).min(3, 'Location must be at least 3 characters').trim(),
    requiredTrades: z.array(z.enum(Object.values(Trades))).nonempty('Must specify at least one required trade'),
    requiredWorkers: z.number({
      required_error: 'Number of required workers is required'
    }).min(1, 'Must require at least 1 worker'),
    startDate: dateValidator,
    endDate: dateValidator,
    dailyWage: z.number({
      required_error: 'Daily wage is required'
    }).min(0, 'Daily wage cannot be negative'),
    status: z.enum(Object.values(ProjectStatus)).optional().default(ProjectStatus.OPEN)
  }).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be on or after start date',
    path: ['endDate']
  })
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').trim().optional(),
    description: z.string().trim().optional(),
    location: z.string().min(3, 'Location must be at least 3 characters').trim().optional(),
    requiredTrades: z.array(z.enum(Object.values(Trades))).nonempty('Must specify at least one required trade').optional(),
    requiredWorkers: z.number().min(1, 'Must require at least 1 worker').optional(),
    startDate: dateValidator.optional(),
    endDate: dateValidator.optional(),
    dailyWage: z.number().min(0, 'Daily wage cannot be negative').optional(),
    status: z.enum(Object.values(ProjectStatus)).optional()
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  }, {
    message: 'End date must be on or after start date',
    path: ['endDate']
  })
});

export default { createProjectSchema, updateProjectSchema };
