import { Router } from 'express';
import db from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
    try {
        const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('student');
        const totalAdvances = db.prepare('SELECT COUNT(*) as count FROM advances').get();
        const pendingAdvances = db.prepare('SELECT COUNT(*) as count FROM advances WHERE status = ?').get('pending');
        const activeAdvances = db.prepare('SELECT COUNT(*) as count FROM advances WHERE status = ?').get('active');
        const completedAdvances = db.prepare('SELECT COUNT(*) as count FROM advances WHERE status = ?').get('completed');

        const totalFundsDistributed = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM advances WHERE status IN ('active', 'completed')
    `).get();

        const totalSavings = db.prepare(`
      SELECT COALESCE(SUM(current_amount), 0) as total FROM savings_buckets
    `).get();

        const repaymentStats = db.prepare(`
      SELECT 
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue
      FROM repayments
    `).get();

        res.json({
            users: totalUsers.count,
            advances: {
                total: totalAdvances.count,
                pending: pendingAdvances.count,
                active: activeAdvances.count,
                completed: completedAdvances.count
            },
            fundsDistributed: totalFundsDistributed.total,
            totalSavings: totalSavings.total,
            repayments: repaymentStats
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

// Get all users
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
    try {
        const users = db.prepare(`
      SELECT id, email, full_name, role, wallet_address, created_at
      FROM users ORDER BY created_at DESC
    `).all();
        res.json(users);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Get all advances
router.get('/advances', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { status } = req.query;
        let query = `
      SELECT a.*, u.email, u.full_name, s.name as school_name
      FROM advances a
      JOIN users u ON a.user_id = u.id
      JOIN schools s ON a.school_id = s.id
    `;

        const params = [];
        if (status) {
            query += ' WHERE a.status = ?';
            params.push(status);
        }
        query += ' ORDER BY a.created_at DESC';

        const advances = db.prepare(query).all(...params);
        res.json(advances);
    } catch (err) {
        console.error('Get advances error:', err);
        res.status(500).json({ error: 'Failed to get advances' });
    }
});

// Approve/Reject advance
router.put('/advances/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { status, notes } = req.body;
        const advanceId = req.params.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be approved or rejected' });
        }

        const advance = db.prepare('SELECT * FROM advances WHERE id = ? AND status = ?').get(advanceId, 'pending');
        if (!advance) {
            return res.status(404).json({ error: 'Pending advance not found' });
        }

        if (status === 'approved') {
            // Update advance status
            db.prepare(`
        UPDATE advances SET status = 'active', admin_notes = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(notes || null, advanceId);

            // Generate repayment schedule
            const monthlyAmount = advance.total_repayment / advance.duration_months;
            const insertRepayment = db.prepare(`
        INSERT INTO repayments (advance_id, amount, due_date, status) VALUES (?, ?, ?, 'pending')
      `);

            for (let i = 1; i <= advance.duration_months; i++) {
                const dueDate = new Date();
                dueDate.setMonth(dueDate.getMonth() + i);
                insertRepayment.run(advanceId, monthlyAmount, dueDate.toISOString().split('T')[0]);
            }

            res.json({ message: 'Advance approved and repayment schedule created' });
        } else {
            db.prepare(`
        UPDATE advances SET status = 'rejected', admin_notes = ? WHERE id = ?
      `).run(notes || null, advanceId);

            res.json({ message: 'Advance rejected' });
        }
    } catch (err) {
        console.error('Update advance error:', err);
        res.status(500).json({ error: 'Failed to update advance' });
    }
});

// Get all schools
router.get('/schools', authenticateToken, requireAdmin, (req, res) => {
    try {
        const schools = db.prepare('SELECT * FROM schools ORDER BY created_at DESC').all();
        res.json(schools);
    } catch (err) {
        console.error('Get schools error:', err);
        res.status(500).json({ error: 'Failed to get schools' });
    }
});

// Add new school
router.post('/schools', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { name, walletAddress, verified } = req.body;

        if (!name || !walletAddress) {
            return res.status(400).json({ error: 'Name and wallet address are required' });
        }

        const result = db.prepare(`
      INSERT INTO schools (name, wallet_address, verified) VALUES (?, ?, ?)
    `).run(name, walletAddress, verified ? 1 : 0);

        res.status(201).json({
            message: 'School added',
            school: { id: result.lastInsertRowid, name, walletAddress, verified: !!verified }
        });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ error: 'Wallet address already exists' });
        }
        console.error('Add school error:', err);
        res.status(500).json({ error: 'Failed to add school' });
    }
});

// Toggle school verification
router.patch('/schools/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { verified } = req.body;
        db.prepare('UPDATE schools SET verified = ? WHERE id = ?').run(verified ? 1 : 0, req.params.id);
        res.json({ message: 'School updated' });
    } catch (err) {
        console.error('Update school error:', err);
        res.status(500).json({ error: 'Failed to update school' });
    }
});

export default router;
