import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
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
                    options: {
                        data: {
                            username: username || email.split('@')[0],
                        }
                    }
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
                        {!isLogin && (
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <input
                                    className="input-field"
                                    type="text"
                                    placeholder="PLAYER NAME"
                                    value={username}
                                    required={!isLogin}
                                    onChange={(e) => setUsername(e.target.value)}
                                    maxLength={20}
                                />
                            </div>
                        )}
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
