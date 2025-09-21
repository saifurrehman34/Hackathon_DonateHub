const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Campaign description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    enum: ['health', 'education', 'disaster', 'others'],
    required: [true, 'Campaign category is required']
  },
  goalAmount: {
    type: Number,
    required: [true, 'Goal amount is required'],
    min: [1, 'Goal amount must be at least 1']
  },
  raisedAmount: {
    type: Number,
    default: 0,
    min: [0, 'Raised amount cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
});

// Virtual for progress percentage
campaignSchema.virtual('progressPercentage').get(function() {
  return Math.min((this.raisedAmount / this.goalAmount) * 100, 100);
});

// Ensure virtual fields are serialized
campaignSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Campaign', campaignSchema);

