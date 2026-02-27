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
            position: 'relative',
            minHeight: '100vh',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#050B14' // Deep night sky
        }}>
            {/* Dynamic Animated Background (Leaves & Dust) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            y: -100, x: Math.random() * window.innerWidth,
                            opacity: 0, rotate: 0
                        }}
                        animate={{
                            y: window.innerHeight + 100,
                            x: Math.random() * window.innerWidth + (Math.random() > 0.5 ? 200 : -200),
                            opacity: [0, 0.8, 0],
                            rotate: 360
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: "linear"
                        }}
                        style={{
                            position: 'absolute',
                            width: Math.random() > 0.5 ? '15px' : '8px',
                            height: Math.random() > 0.5 ? '15px' : '8px',
                            background: Math.random() > 0.5 ? '#10b981' : '#8b5cf6',
                            borderRadius: Math.random() > 0.5 ? '50% 0 50% 0' : '50%',
                            filter: 'blur(1px)',
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)'
                        }}
                    />
                ))}
                {/* Magical Core Glow */}
                <div className="animate-pulse-glow" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 60%)', filter: 'blur(50px)' }} />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={isLogin ? 'login' : 'register'}
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -30 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    style={{
                        width: '100%', maxWidth: '450px', padding: '3rem', zIndex: 1,
                        background: 'rgba(10, 15, 30, 0.5)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <motion.h1
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                            style={{
                                fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 800,
                                background: 'linear-gradient(135deg, #10b981, #8b5cf6)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}
                        >
                            QuestBloom
                        </motion.h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontStyle: 'italic' }}>
                            Convierte tu disciplina en un ecosistema legendario.
                        </p>
                    </div>

                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <input
                                className="input-field"
                                type="email"
                                placeholder="Correo Mágico..."
                                value={email}
                                required
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}
                            />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <input
                                className="input-field"
                                type="password"
                                placeholder="Contraseña de Poder..."
                                value={password}
                                required
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}
                            />
                        </div>

                        {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}
                        {message && <p style={{ color: 'var(--success)', fontSize: '0.85rem', textAlign: 'center' }}>{message}</p>}

                        <button
                            className="btn"
                            style={{
                                width: '100%', marginTop: '1rem', padding: '1rem', borderRadius: '12px', fontSize: '1.1rem',
                                background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)', transition: 'all 0.3s ease', cursor: 'pointer'
                            }}
                            disabled={loading}
                            type="submit"
                            onMouseOver={(e) => e.target.style.boxShadow = '0 0 40px rgba(16, 185, 129, 0.8)'}
                            onMouseOut={(e) => e.target.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)'}
                        >
                            {loading ? 'Invocando...' : (isLogin ? 'Adentrarse al Bosque' : 'Crear Leyenda')}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ position: 'relative', background: '#0a0f1e', padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>O viaja ligero</span>
                    </div>

                    <button
                        onClick={handleGuestLogin}
                        className="btn"
                        style={{
                            width: '100%', marginTop: '1.5rem', padding: '1rem', borderRadius: '12px',
                            background: 'rgba(139, 92, 246, 0.1)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.3)',
                            transition: 'all 0.3s ease', cursor: 'pointer'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = 'rgba(139, 92, 246, 0.2)';
                            e.target.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.5)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Entrar como Invitado (Modo Demo)
                    </button>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            {isLogin ? "¿Nuevo aventurero? Registrarse" : '¿Ya tienes un legado? Ingresar'}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
