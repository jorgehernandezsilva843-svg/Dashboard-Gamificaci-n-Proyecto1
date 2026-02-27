import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Registration successful! You can now log in.');
                setIsLogin(true); // Switch to login after signup
            }
        } catch (error) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={isLogin ? 'login' : 'register'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="glass-panel"
                    style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                            Proyecto U1
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {isLogin ? 'Welcome back, hero.' : 'Begin your journey.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth}>
                        <div className="input-group">
                            <label className="input-label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                className="input-field"
                                type="email"
                                placeholder="hero@example.com"
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label" htmlFor="password">Password</label>
                            <input
                                id="password"
                                className="input-field"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '1rem', textAlign: 'center' }}>
                                {error}
                            </p>
                        )}

                        {message && (
                            <p style={{ color: 'var(--success)', fontSize: '0.875rem', marginTop: '1rem', textAlign: 'center' }}>
                                {message}
                            </p>
                        )}

                        <button
                            className="btn btn-primary animate-pulse-glow"
                            style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }}
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                                setMessage(null);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                textDecoration: 'underline'
                            }}
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
