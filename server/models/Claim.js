const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Field Observation',
        'Local Knowledge',
        'AI Correction',
        'Expert Knowledge',
        'Infrastructure Issue',
        'Environment/Climate Observation',
        'Creative Idea',
        'Other',
      ],
    },
    description: { type: String, required: true },
    usefulnessExplanation: { type: String, required: true },
    evidenceLink: { type: String, default: '' },
    location: { type: String, default: '' },
    date: { type: Date, default: null },
    contributorName: { type: String, required: true, trim: true },
    consentGiven: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Submitted', 'Needs Review', 'Verified', 'Rejected', 'Needs More Evidence'],
      default: 'Submitted',
    },
    knowledgeValueScore: { type: Number, default: 0 },
    confidenceLevel: { type: String, default: 'Low Confidence' },
    completenessScore: { type: Number, default: 0 },
    suggestedAIUsage: { type: String, default: 'Needs More Evidence' },
    reviewerFeedback: { type: String, default: '' },
    reviewerScore: { type: Number, default: 0, min: 0, max: 10 },
    aiUsefulnessClassification: {
      type: String,
      enum: [
        'Useful for AI Training',
        'Useful for AI Evaluation',
        'Useful for Knowledge Base',
        'Useful for Hallucination Correction',
        'Not Suitable',
        'Unclassified',
      ],
      default: 'Unclassified',
    },
    riskFlags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Claim', claimSchema);
