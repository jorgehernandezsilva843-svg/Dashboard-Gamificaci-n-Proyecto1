import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Music, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { supabase } from '../lib/supabase';

// Constantes Pomodoro
const WORK_MINUTES = 30;
const BREAK_MINUTES = 5;

export default function PomodoroTimer() {
    const { profile, updateProfile, isGuest } = useGame();

    const [mode, setMode] = useState('work'); // 'work' or 'break'
    const [timeLeft, setTimeLeft] = useState(WORK_MINUTES * 60);
    const [isActive, setIsActive] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const audioRef = useRef(null);
    const timerRef = useRef(null);

    // Set Audio Volume to 30%
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.3;
        }
    }, []);

    // Save timer state to localStorage periodically if active to prevent complete wipe on refresh
    useEffect(() => {
        if (isActive) {
            localStorage.setItem('questbloom_pomo_time', timeLeft);
            localStorage.setItem('questbloom_pomo_mode', mode);
            // Signal global state that hyper-growth is active
            if (mode === 'work') localStorage.setItem('questbloom_hyper_growth', 'true');
        } else {
            localStorage.setItem('questbloom_hyper_growth', 'false');
        }
    }, [timeLeft, isActive, mode]);

    // Timer Logic
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (isActive && timeLeft === 0) {
            handleComplete();
        }

        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft]);

    const handleComplete = () => {
        clearInterval(timerRef.current);
        if (mode === 'work') {
            setMode('break');
            setTimeLeft(BREAK_MINUTES * 60);
            alert("¡Trabajo de concentración terminado! Las plantas han crecido aceleradamente. Es hora de un descanso de 5 minutos.");
        } else {
            setMode('work');
            setTimeLeft(WORK_MINUTES * 60);
            setIsActive(false);
            audioRef.current?.pause();
            alert("¡Descanso terminado! Listo para otra sesión cuando quieras.");
        }
    };

    const togglePlay = () => {
        if (isActive) {
            // Penalización por cancelar antes de tiempo
            if (mode === 'work' && timeLeft < WORK_MINUTES * 60) {
                const confirmCancel = window.confirm("¿Seguro que quieres cancelar? Perderás 5 monedas como penalización y el monstruo atacará.");
                if (!confirmCancel) return;

                // Aplicar penalización
                if (profile && profile.coins >= 5) {
                    updateProfile({ coins: profile.coins - 5 });
                }
            }

            clearInterval(timerRef.current);
            setIsActive(false);
            audioRef.current?.pause();
            setMode('work');
            setTimeLeft(WORK_MINUTES * 60);
        } else {
            setIsActive(true);
            audioRef.current?.play().catch(e => console.log("Audio play prevented by browser", e));
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '1rem'
        }}>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="glass-panel"
                        style={{ padding: '1.5rem', width: '280px', border: 'var(--pixel-border)', background: 'var(--bg-secondary)' }}
                    >
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px dashed var(--text-muted)', paddingBottom: '0.5rem' }}>
                            <Flame size={16} color="var(--warning)" /> Santuario de Concentración
                        </h4>

                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', color: mode === 'work' ? 'var(--accent-primary)' : 'var(--water)', marginBottom: '0.5rem' }}>
                                {mode === 'work' ? 'ESTUDIO INTENSO (2x Crecimiento)' : 'DESCANSO ZEN'}
                            </div>
                            <div style={{
                                fontSize: '3.5rem',
                                fontWeight: 'bold',
                                color: mode === 'work' ? '#ff0000' : '#00ff00',
                                textShadow: mode === 'work' ? '0 0 10px #ff0000' : '0 0 10px #00ff00',
                                background: '#111',
                                border: 'var(--pixel-border-sm)',
                                padding: '1rem 0',
                                fontFamily: '"Press Start 2P", monospace',
                                display: 'inline-block',
                                width: '100%'
                            }}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        <div className="flex-center" style={{ gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={togglePlay}
                                className="btn"
                                style={{
                                    background: isActive ? 'var(--danger)' : 'var(--accent-primary)',
                                    color: isActive ? 'white' : '#000',
                                    padding: '0.75rem',
                                    width: '100%'
                                }}
                            >
                                {isActive ? <><Square size={16} /> ABANDONAR</> : <><Play size={16} /> INICIAR</>}
                            </button>
                        </div>

                        {/* Dummy 8-bit / Lo-Fi Audio Element */}
                        <audio
                            ref={audioRef}
                            src="https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" // Royalty free lofi hip hop track
                            loop
                            muted={isMuted}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`glass-panel ${isActive && mode === 'work' ? 'animate-pulse-glow' : ''}`}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: 'var(--pixel-border)',
                    background: isActive ? (mode === 'work' ? 'var(--accent-primary)' : 'var(--water)') : 'var(--bg-tertiary)',
                    color: isActive ? (mode === 'work' ? '#000' : '#fff') : 'var(--text-primary)',
                    boxShadow: 'var(--shadow-retro)'
                }}
            >
                <Music size={24} />
            </button>
        </div>
    );
}
