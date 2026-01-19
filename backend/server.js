import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import advancesRoutes from './routes/advances.js';
import savingsRoutes from './routes/savings.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/advances', advancesRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`🚀 EduFund API running at http://localhost:${PORT}`);
    console.log(`📚 Endpoints:`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET  /api/auth/me`);
    console.log(`   GET  /api/advances`);
    console.log(`   POST /api/advances`);
    console.log(`   GET  /api/savings`);
    console.log(`   POST /api/savings`);
    console.log(`   GET  /api/admin/stats`);
});
