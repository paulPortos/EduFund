import { Router } from 'express';
import db from '../database.js';
import { authenticateToken, requireStudent } from '../middleware/auth.js';

const router = Router();

// Get user's savings buckets
router.get('/', authenticateToken, requireStudent, (req, res) => {
    try {
        const buckets = db.prepare(`
      SELECT * FROM savings_buckets WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

        res.json(buckets);
    } catch (err) {
        console.error('Get savings error:', err);
        res.status(500).json({ error: 'Failed to get savings buckets' });
    }
});

// Get single bucket with transactions
router.get('/:id', authenticateToken, requireStudent, (req, res) => {
    try {
        const bucket = db.prepare(`
      SELECT * FROM savings_buckets WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

        if (!bucket) {
            return res.status(404).json({ error: 'Bucket not found' });
        }

        const transactions = db.prepare(`
      SELECT * FROM savings_transactions WHERE bucket_id = ? ORDER BY created_at DESC
    `).all(req.params.id);

        res.json({ ...bucket, transactions });
    } catch (err) {
        console.error('Get bucket error:', err);
        res.status(500).json({ error: 'Failed to get bucket' });
    }
});

// Create new savings bucket
router.post('/', authenticateToken, requireStudent, (req, res) => {
    try {
        const { name, targetAmount, frequency } = req.body;

        if (!name || !targetAmount) {
            return res.status(400).json({ error: 'Name and target amount are required' });
        }

        if (targetAmount < 1000) {
            return res.status(400).json({ error: 'Target amount must be at least ₱1,000' });
        }

        const result = db.prepare(`
      INSERT INTO savings_buckets (user_id, name, target_amount, frequency)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, name, targetAmount, frequency || 'weekly');

        res.status(201).json({
            message: 'Savings bucket created',
            bucket: {
                id: result.lastInsertRowid,
                name,
                targetAmount,
                currentAmount: 0,
                frequency: frequency || 'weekly',
                status: 'active'
            }
        });
    } catch (err) {
        console.error('Create bucket error:', err);
        res.status(500).json({ error: 'Failed to create bucket' });
    }
});

// Deposit to bucket
router.post('/:id/deposit', authenticateToken, requireStudent, (req, res) => {
    try {
        const { amount } = req.body;
        const bucketId = req.params.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        const bucket = db.prepare(`
      SELECT * FROM savings_buckets WHERE id = ? AND user_id = ? AND status = 'active'
    `).get(bucketId, req.user.id);

        if (!bucket) {
            return res.status(404).json({ error: 'Active bucket not found' });
        }

        // Create transaction
        db.prepare(`
      INSERT INTO savings_transactions (bucket_id, amount, type) VALUES (?, ?, 'deposit')
    `).run(bucketId, amount);

        // Update bucket balance
        const newAmount = bucket.current_amount + amount;
        const newStatus = newAmount >= bucket.target_amount ? 'completed' : 'active';

        db.prepare(`
      UPDATE savings_buckets SET current_amount = ?, status = ? WHERE id = ?
    `).run(newAmount, newStatus, bucketId);

        res.json({
            message: 'Deposit successful',
            currentAmount: newAmount,
            targetAmount: bucket.target_amount,
            progress: ((newAmount / bucket.target_amount) * 100).toFixed(1) + '%',
            status: newStatus
        });
    } catch (err) {
        console.error('Deposit error:', err);
        res.status(500).json({ error: 'Failed to process deposit' });
    }
});

// Withdraw from bucket
router.post('/:id/withdraw', authenticateToken, requireStudent, (req, res) => {
    try {
        const { amount } = req.body;
        const bucketId = req.params.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        const bucket = db.prepare(`
      SELECT * FROM savings_buckets WHERE id = ? AND user_id = ?
    `).get(bucketId, req.user.id);

        if (!bucket) {
            return res.status(404).json({ error: 'Bucket not found' });
        }

        if (amount > bucket.current_amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Create transaction
        db.prepare(`
      INSERT INTO savings_transactions (bucket_id, amount, type) VALUES (?, ?, 'withdrawal')
    `).run(bucketId, amount);

        // Update bucket balance
        const newAmount = bucket.current_amount - amount;
        db.prepare(`
      UPDATE savings_buckets SET current_amount = ?, status = 'active' WHERE id = ?
    `).run(newAmount, bucketId);

        res.json({
            message: 'Withdrawal successful',
            currentAmount: newAmount,
            targetAmount: bucket.target_amount
        });
    } catch (err) {
        console.error('Withdrawal error:', err);
        res.status(500).json({ error: 'Failed to process withdrawal' });
    }
});

export default router;
