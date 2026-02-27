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
                setMessage('Registrado! Ahora puedes iniciar sesión.');
                setIsLogin(true);
            }
        } catch (error) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = () => {
        const fakeSession = {
            access_token: 'fake', refresh_token: 'fake', expires_in: 3600, expires_at: 0, token_type: 'bearer',
            user: { id: 'guest-user', email: 'guest@questbloom.com' }
        };
        // We simulate a supabase response format for the App.jsx to pick up
        // Note: App relies on getting the session via state, but normally we check supabase.auth.getSession.
        // For the mock, we can broadcast an auth stage change or manipulate localStorage
        // A cleaner way for our prototype is to just trigger a window event that App.jsx listens to, 
        // or just set a localStorage item to tell App.jsx to fake the session.
        localStorage.setItem('questbloom_guest', 'true');
        window.location.href = '/dashboard';
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={isLogin ? 'login' : 'register'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card"
                    style={{
                        width: '100%', maxWidth: '400px',
                        display: 'flex', flexDirection: 'column', gap: '1.5rem',
                        background: 'var(--bg-secondary)',
                        position: 'relative'
                    }}
                >
                    {/* Retro Corner Accents */}
                    <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '8px', height: '8px', background: '#000' }} />
                    <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: '#000' }} />
                    <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '8px', height: '8px', background: '#000' }} />
                    <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '8px', height: '8px', background: '#000' }} />

                    <div style={{ textAlign: 'center' }}>
                        <h1 className="text-gradient" style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
                            QUESTBLOOM
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                            START YOUR RETRO JOURNEY
                        </p>
                    </div>

                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <input
                                className="input-field"
                                type="email"
                                placeholder="PLAYER EMAIL"
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <input
                                className="input-field"
                                type="password"
                                placeholder="SECRET PASSCODE"
                                value={password}
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && <p style={{ color: 'var(--danger)', fontSize: '0.6rem', textAlign: 'center' }}>{error}</p>}
                        {message && <p style={{ color: 'var(--success)', fontSize: '0.6rem', textAlign: 'center' }}>{message}</p>}

                        <button
                            className="btn btn-primary"
                            disabled={loading}
                            type="submit"
                            style={{ padding: '1rem', marginTop: '0.5rem' }}
                        >
                            {loading ? 'WAIT...' : (isLogin ? 'START GAME' : 'NEW SAVE')}
                        </button>
                    </form>

                    <button
                        onClick={handleGuestLogin}
                        className="btn btn-secondary"
                    >
                        [ GUEST DEMO ]
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }}
                            style={{
                                background: 'none', border: 'none',
                                color: 'var(--accent-secondary)', cursor: 'pointer',
                                fontSize: '0.65rem', fontFamily: 'inherit',
                                textDecoration: 'underline'
                            }}
                        >
                            {isLogin ? "NO SAVE DATA? REGISTER" : 'LOAD EXISTING SAVE'}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
