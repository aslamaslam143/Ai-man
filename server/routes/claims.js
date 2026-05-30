const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const { calculateScore } = require('../utils/scoring');

// GET stats overview — MUST be before /:id
router.get('/stats/overview', async (req, res) => {
  try {
    const [total, verified, pending, needsReview, rejected, needsMoreEvidence] = await Promise.all([
      Claim.countDocuments(),
      Claim.countDocuments({ status: 'Verified' }),
      Claim.countDocuments({ status: 'Submitted' }),
      Claim.countDocuments({ status: 'Needs Review' }),
      Claim.countDocuments({ status: 'Rejected' }),
      Claim.countDocuments({ status: 'Needs More Evidence' }),
    ]);

    const avgScoreResult = await Claim.aggregate([
      { $group: { _id: null, avg: { $avg: '$knowledgeValueScore' } } },
    ]);

    const categoryDist = await Claim.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      total,
      verified,
      pending,
      needsReview,
      rejected,
      needsMoreEvidence,
      averageScore: avgScoreResult[0]?.avg?.toFixed(1) || 0,
      categoryDistribution: categoryDist,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all claims (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { status, category, contributorName } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (contributorName) filter.contributorName = { $regex: contributorName, $options: 'i' };

    const claims = await Claim.find(filter).sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single claim
router.get('/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    res.json(claim);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create claim
router.post('/', async (req, res) => {
  try {
    const scoreData = calculateScore(req.body);
    const claim = new Claim({ ...req.body, ...scoreData, status: 'Submitted' });
    await claim.save();
    res.status(201).json(claim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update claim (reviewer actions, status changes)
router.patch('/:id', async (req, res) => {
  try {
    const claim = await Claim.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    res.json(claim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE claim
router.delete('/:id', async (req, res) => {
  try {
    const claim = await Claim.findByIdAndDelete(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    res.json({ message: 'Claim deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
