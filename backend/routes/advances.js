import { Router } from 'express';
import db from '../database.js';
import { authenticateToken, requireStudent } from '../middleware/auth.js';

const router = Router();

// Get all schools (for dropdown)
router.get('/schools', authenticateToken, (req, res) => {
    try {
        const schools = db.prepare('SELECT id, name, wallet_address FROM schools WHERE verified = 1').all();
        res.json(schools);
    } catch (err) {
        console.error('Get schools error:', err);
        res.status(500).json({ error: 'Failed to get schools' });
    }
});

// Get user's advances
router.get('/', authenticateToken, requireStudent, (req, res) => {
    try {
        const advances = db.prepare(`
      SELECT a.*, s.name as school_name, s.wallet_address as school_wallet
      FROM advances a
      JOIN schools s ON a.school_id = s.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `).all(req.user.id);

        res.json(advances);
    } catch (err) {
        console.error('Get advances error:', err);
        res.status(500).json({ error: 'Failed to get advances' });
    }
});

// Get single advance with repayments
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const advance = db.prepare(`
      SELECT a.*, s.name as school_name, s.wallet_address as school_wallet
      FROM advances a
      JOIN schools s ON a.school_id = s.id
      WHERE a.id = ? AND a.user_id = ?
    `).get(req.params.id, req.user.id);

        if (!advance) {
            return res.status(404).json({ error: 'Advance not found' });
        }

        const repayments = db.prepare(`
      SELECT * FROM repayments WHERE advance_id = ? ORDER BY due_date ASC
    `).all(req.params.id);

        res.json({ ...advance, repayments });
    } catch (err) {
        console.error('Get advance error:', err);
        res.status(500).json({ error: 'Failed to get advance' });
    }
});

// Request new advance
router.post('/', authenticateToken, requireStudent, (req, res) => {
    try {
        const { schoolId, amount, durationMonths } = req.body;

        if (!schoolId || !amount || !durationMonths) {
            return res.status(400).json({ error: 'School, amount, and duration are required' });
        }

        if (amount < 1000 || amount > 500000) {
            return res.status(400).json({ error: 'Amount must be between ₱1,000 and ₱500,000' });
        }

        if (durationMonths < 3 || durationMonths > 6) {
            return res.status(400).json({ error: 'Duration must be 3-6 months' });
        }

        // Check for existing pending/active advance
        const existingAdvance = db.prepare(`
      SELECT id FROM advances WHERE user_id = ? AND status IN ('pending', 'active')
    `).get(req.user.id);

        if (existingAdvance) {
            return res.status(400).json({ error: 'You already have a pending or active advance' });
        }

        // Calculate interest (fixed rate: 2% per month, simple interest)
        const interestRate = 0.02 * durationMonths;
        const totalRepayment = amount * (1 + interestRate);
        const monthlyPayment = totalRepayment / durationMonths;

        // Create advance
        const result = db.prepare(`
      INSERT INTO advances (user_id, school_id, amount, duration_months, interest_rate, total_repayment, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).run(req.user.id, schoolId, amount, durationMonths, interestRate, totalRepayment);

        res.status(201).json({
            message: 'Advance request submitted',
            advance: {
                id: result.lastInsertRowid,
                amount,
                durationMonths,
                interestRate: (interestRate * 100).toFixed(1) + '%',
                totalRepayment: totalRepayment.toFixed(2),
                monthlyPayment: monthlyPayment.toFixed(2),
                status: 'pending'
            }
        });
    } catch (err) {
        console.error('Create advance error:', err);
        res.status(500).json({ error: 'Failed to create advance' });
    }
});

// Make early repayment
router.post('/:id/repay', authenticateToken, requireStudent, (req, res) => {
    try {
        const { amount } = req.body;
        const advanceId = req.params.id;

        const advance = db.prepare(`
      SELECT * FROM advances WHERE id = ? AND user_id = ? AND status = 'active'
    `).get(advanceId, req.user.id);

        if (!advance) {
            return res.status(404).json({ error: 'Active advance not found' });
        }

        // Get pending repayments
        const pendingRepayments = db.prepare(`
      SELECT * FROM repayments WHERE advance_id = ? AND status = 'pending' ORDER BY due_date ASC
    `).all(advanceId);

        if (pendingRepayments.length === 0) {
            return res.status(400).json({ error: 'No pending repayments' });
        }

        // Apply payment to next pending repayment
        const nextRepayment = pendingRepayments[0];
        db.prepare(`
      UPDATE repayments SET status = 'paid', paid_date = CURRENT_TIMESTAMP WHERE id = ?
    `).run(nextRepayment.id);

        // Check if all repayments are complete
        const remainingCount = db.prepare(`
      SELECT COUNT(*) as count FROM repayments WHERE advance_id = ? AND status = 'pending'
    `).get(advanceId);

        if (remainingCount.count === 0) {
            db.prepare(`UPDATE advances SET status = 'completed' WHERE id = ?`).run(advanceId);
        }

        res.json({ message: 'Repayment recorded', remaining: remainingCount.count });
    } catch (err) {
        console.error('Repayment error:', err);
        res.status(500).json({ error: 'Failed to process repayment' });
    }
});

export default router;
