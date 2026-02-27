import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { supabase } from '../lib/supabase';

export default function FocusPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { profile } = useGame();

    // Real implementation would use an actual audio file from a public folder or external URL
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Penalize user if they leave the tab while playing focus music
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden && isPlaying && profile) {
                // Monster counter-attacks! Penalty for leaving the tab
                setIsPlaying(false);
                audioRef.current?.pause();

                // Deduct 2 coins as penalty
                if (profile.coins >= 2) {
                    await supabase.from('profiles').update({ coins: profile.coins - 2 }).eq('id', profile.id);
                    // Normally we'd dispatch an alert here or toast notification
                    console.log("Monster counter-attacked! Lost 2 coins for losing focus.");
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isPlaying, profile]);

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
                        style={{ padding: '1rem', width: '250px' }}
                    >
                        <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Music size={16} className="text-gradient" /> Focus Track
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Lluvia Suave (Unlocked)
                        </p>
                        <div className="flex-between">
                            <button
                                onClick={togglePlay}
                                className="btn btn-primary"
                                style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }}
                            >
                                {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
                            </button>

                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                        </div>

                        {/* Dummy Audio Element for realistic mechanics */}
                        <audio
                            ref={audioRef}
                            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                            loop
                            muted={isMuted}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`glass-panel ${isPlaying ? 'animate-pulse-glow' : ''}`}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: isPlaying ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                    color: isPlaying ? 'var(--accent-primary)' : 'var(--text-primary)'
                }}
            >
                <Music size={24} />
            </button>
        </div>
    );
}
