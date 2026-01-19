import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
    return (
        <div className="landing">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content animate-slide-up">
                        <h1 className="hero-title">
                            <span className="text-gradient">Education First,</span>
                            <br />
                            Debt Last.
                        </h1>
                        <p className="hero-subtitle">
                            EduFund PH helps Filipino families bridge tuition gaps with transparent,
                            low-cost advances and disciplined savings — all on the Sui blockchain.
                        </p>
                        <div className="hero-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Start Saving Today
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-lg">
                                Sign In
                            </Link>
                        </div>
                    </div>
                    <div className="hero-visual animate-float">
                        <div className="hero-card">
                            <div className="hero-card-header">
                                <span className="hero-card-icon">📚</span>
                                <span>Tuition Advance</span>
                            </div>
                            <div className="hero-card-amount">₱50,000</div>
                            <div className="hero-card-detail">6-month repayment @ 12% fixed</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title text-center">How EduFund Works</h2>
                    <div className="features-grid stagger">
                        <div className="feature-card card">
                            <div className="feature-icon">💰</div>
                            <h3 className="feature-title">Tuition Advances</h3>
                            <p className="feature-desc">
                                Get up to ₱500,000 for tuition, sent directly to your school.
                                Fixed interest, no hidden fees, 3-6 month terms.
                            </p>
                        </div>
                        <div className="feature-card card">
                            <div className="feature-icon">🎯</div>
                            <h3 className="feature-title">Savings Buckets</h3>
                            <p className="feature-desc">
                                Set goals and save weekly or bi-weekly. Track progress
                                with visual milestones and celebrate completions.
                            </p>
                        </div>
                        <div className="feature-card card">
                            <div className="feature-icon">🔗</div>
                            <h3 className="feature-title">On-Chain Transparency</h3>
                            <p className="feature-desc">
                                Every payment is recorded on Sui blockchain.
                                Proof of payment you can trust, forever.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-card card">
                            <div className="stat-value">2%</div>
                            <div className="stat-label">Monthly Interest Rate</div>
                        </div>
                        <div className="stat-card card">
                            <div className="stat-value">₱0</div>
                            <div className="stat-label">Early Repayment Penalty</div>
                        </div>
                        <div className="stat-card card">
                            <div className="stat-value">24hr</div>
                            <div className="stat-label">Approval Time</div>
                        </div>
                        <div className="stat-card card">
                            <div className="stat-value">100%</div>
                            <div className="stat-label">To Verified Schools</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card card">
                        <h2 className="cta-title">Ready to Fund Your Future?</h2>
                        <p className="cta-desc">
                            Join thousands of Filipino families building a brighter educational future.
                        </p>
                        <Link to="/register" className="btn btn-gold btn-lg">
                            Create Free Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="logo-icon">E</span>
                            <span className="logo-text">EduFund PH</span>
                        </div>
                        <p className="footer-tagline">Education first, debt last.</p>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 EduFund PH. Built on Sui Blockchain.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
