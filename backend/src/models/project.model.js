import mongoose from 'mongoose';
import { Trades } from '../enums/trade.enum.js';
import { ProjectStatus } from '../enums/project.status.enum.js';

const projectSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator User ID is required']
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    requiredTrades: {
      type: [String],
      required: [true, 'At least one required trade is required'],
      validate: {
        validator: function(array) {
          return array && array.length > 0 && array.every(trade => Object.values(Trades).includes(trade));
        },
        message: 'Must specify at least one valid trade'
      }
    },
    requiredWorkers: {
      type: Number,
      required: [true, 'Number of required workers is required'],
      min: [1, 'Must require at least 1 worker']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    dailyWage: {
      type: Number,
      required: [true, 'Daily wage is required'],
      min: [0, 'Daily wage cannot be negative']
    },
    status: {
      type: String,
      required: [true, 'Project status is required'],
      enum: {
        values: Object.values(ProjectStatus),
        message: 'Invalid project status value'
      },
      default: ProjectStatus.OPEN
    }
  },
  {
    timestamps: true
  }
);

// Database Indexes for optimized querying
projectSchema.index({ orgId: 1, status: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
