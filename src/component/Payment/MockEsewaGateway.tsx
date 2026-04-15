import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MockEsewaGateway.css';

const MockEsewaGateway: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { bookingId, amount: initialAmount } = location.state || {};
    
    const [step, setStep] = useState<'amount' | 'login'>('amount');
    const [amount, setAmount] = useState(initialAmount?.toString() || '1000');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isCaptchaChecked, setIsCaptchaChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingBooking, setIsFetchingBooking] = useState(false);

    // Fetch latest booking details to ensure accurate amount
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!bookingId) return;
            
            setIsFetchingBooking(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await response.json();
                
                if (result.success && result.data) {
                    setAmount(result.data.totalAmount.toString());
                }
            } catch (error) {
                console.error('Error fetching booking details:', error);
            } finally {
                setIsFetchingBooking(false);
            }
        };

        fetchBookingDetails();
    }, [bookingId]);

    // Auto-fill login details for demo
    useEffect(() => {
        setMobile('9806800001');
        setPassword('password123');
    }, []);

    const handleLogin = () => {
        if (!isCaptchaChecked) {
            alert("Please complete the reCAPTCHA");
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            const transactionId = `ESEWA_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            navigate(`/payment/success?status=success&transaction_id=${transactionId}&amount=${amount}${bookingId ? `&bookingId=${bookingId}` : ''}`);
        }, 2000);
    };

    const isLoginValid = mobile.length >= 10 && password.length > 0 && isCaptchaChecked;

    return (
        <div className="esewa-container">
            {/* Header */}
            <header className="esewa-header">
                <div></div>
                <div className="esewa-logo-header">
                    <span className="esewa-logo-text">e<span className="esewa-dot">S</span>ewa</span>
                </div>
                <div>
                    <button className="language-selector">
                        English
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                </div>
            </header>

            {/* Main Section */}
            <main className="esewa-main">
                <div className="esewa-card">
                    {/* Left: Branding & Banner (Always Visible) */}
                    <div className="esewa-info-panel">
                        <div>
                            <div className="merchant-info">
                                <div className="merchant-logo-box">
                                    <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="Merchant" className="merchant-logo-img" />
                                </div>
                                <span className="merchant-name">EPAY TEST</span>
                            </div>

                            <div className="amount-display">
                                <div className="amount-label">Total Amount</div>
                                <div className="amount-value-large">
                                    <span className="currency-code">NPR.</span>
                                    <span>{Number(amount).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="amount-divider"></div>

                            <div className="secondary-amount-row">
                                <span>Total Amount</span>
                                <span>{amount}.0</span>
                            </div>
                        </div>

                        <div className="promo-banner">
                            <img src="/esewa_food_banner_1776249833633.png" alt="Special Offer" />
                        </div>
                    </div>

                    {/* Right: Dynamic Steps */}
                    <div className="esewa-login-panel">
                        {step === 'amount' ? (
                            <div className="step-content animate-fade-in">
                                <h2 className="login-title">How much would you like to pay?</h2>
                                <p className="step-description">Enter the amount in NPR to initiate your secure transfer via eSewa.</p>
                                
                                <div className="amount-entry-group">
                                    <label className="amount-input-label">AMOUNT (NPR)</label>
                                    <div className="amount-input-wrapper">
                                        <span className="amount-prefix">Rs.</span>
                                        <input 
                                            type="number" 
                                            className={`amount-large-input ${isFetchingBooking ? 'animate-pulse' : ''}`}
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            min="1"
                                            disabled={isFetchingBooking || !!bookingId}
                                        />
                                        {isFetchingBooking && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <div className="loading-spinner-small"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    className={`esewa-login-btn active`}
                                    onClick={() => setStep('login')}
                                    style={{ marginTop: '2rem' }}
                                >
                                    Proceed to payment
                                </button>
                                
                                <div className="footer-cancel" style={{ marginTop: 'auto' }}>
                                    <a href="/tenant/dashboard" className="cancel-action">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                                        CANCEL PAYMENT
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="step-content animate-slide-in">
                                <div className="back-btn" onClick={() => setStep('amount')}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                    Edit Amount
                                </div>
                                <h2 className="login-title">Sign in to your account</h2>
                                
                                <div className="esewa-form">
                                    <div className="input-container">
                                        <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                        </svg>
                                        <input 
                                            type="text" 
                                            className="esewa-input" 
                                            placeholder="eSewa ID (Mobile Number)" 
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                        />
                                    </div>

                                    <div className="input-container">
                                        <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        </svg>
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            className="esewa-input" 
                                            placeholder="Password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/><circle cx="12" cy="12" r="3"/></svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                            )}
                                        </button>
                                    </div>

                                    <div className="recaptcha-mock">
                                        <div className="recaptcha-left">
                                            <div 
                                                className={`recaptcha-checkbox ${isCaptchaChecked ? 'checked' : ''}`}
                                                onClick={() => setIsCaptchaChecked(!isCaptchaChecked)}
                                            ></div>
                                            <span className="recaptcha-text">I'm not a robot</span>
                                        </div>
                                        <div className="recaptcha-right">
                                            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" className="recaptcha-logo" alt="reCAPTCHA" />
                                            <span className="recaptcha-policy">Privacy - Terms</span>
                                        </div>
                                    </div>

                                    <button 
                                        className={`esewa-login-btn ${isLoginValid ? 'active' : ''}`}
                                        onClick={handleLogin}
                                        disabled={isLoading || !isLoginValid}
                                    >
                                        {isLoading ? <div className="loading-spinner"></div> : 'Login'}
                                    </button>

                                    <a href="#" className="forgot-password-link">Forgot Password?</a>
                                </div>

                                <div className="register-prompt">
                                    Don't have an account? <a href="#" className="register-action">Register</a>
                                </div>

                                <div className="footer-cancel">
                                    <a href="/tenant/dashboard" className="cancel-action">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                                        CANCEL PAYMENT
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MockEsewaGateway;
