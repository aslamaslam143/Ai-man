const EXPERT_CATEGORIES = ['Expert Knowledge', 'AI Correction'];

function calculateScore(claimData) {
  let score = 0;
  const riskFlags = [];

  // +20 for detailed description (>100 chars)
  if (claimData.description && claimData.description.trim().length > 100) {
    score += 20;
  } else {
    riskFlags.push('Low Detail');
  }

  // +25 for evidence attached
  if (claimData.evidenceLink && claimData.evidenceLink.trim() !== '') {
    score += 25;
  } else {
    riskFlags.push('Missing Evidence');
  }

  // +10 for location provided
  if (claimData.location && claimData.location.trim() !== '') {
    score += 10;
  } else {
    riskFlags.push('No Location Provided');
  }

  // +10 for date provided
  if (claimData.date) {
    score += 10;
  } else {
    riskFlags.push('No Date Provided');
  }

  // +20 for clear usefulness explanation (>50 chars)
  if (claimData.usefulnessExplanation && claimData.usefulnessExplanation.trim().length > 50) {
    score += 20;
  } else {
    riskFlags.push('Weak Usefulness Explanation');
  }

  // +15 for expert category
  if (EXPERT_CATEGORIES.includes(claimData.category)) {
    score += 15;
  }

  score = Math.min(score, 100);

  let confidenceLevel;
  if (score >= 70) confidenceLevel = 'High Confidence';
  else if (score >= 40) confidenceLevel = 'Medium Confidence';
  else confidenceLevel = 'Low Confidence';

  const completenessScore = score;

  let suggestedAIUsage;
  if (score >= 80) suggestedAIUsage = 'Useful for AI Training';
  else if (score >= 60) suggestedAIUsage = 'Useful for Knowledge Base';
  else if (score >= 40) suggestedAIUsage = 'Useful for AI Evaluation';
  else suggestedAIUsage = 'Needs More Evidence';

  return {
    knowledgeValueScore: score,
    confidenceLevel,
    completenessScore,
    suggestedAIUsage,
    riskFlags,
  };
}

module.exports = { calculateScore };
