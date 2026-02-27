import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Flower2, Beaker, Sprout, Trees } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Garden() {
    const { garden, loading } = useGame();
    const [showFusionModal, setShowFusionModal] = useState(false);

    // Helper to map stage to an icon/emoji
    const getPlantVisual = (stage, isWilted) => {
        if (isWilted) return <span style={{ filter: 'grayscale(100%)', opacity: 0.5 }}>🥀</span>;
        switch (stage) {
            case 'seed': return <span style={{ fontSize: '2rem' }}>🌰</span>;
            case 'sprout': return <Sprout size={40} color="var(--success)" />;
            case 'young': return <Trees size={50} color="var(--success)" />;
            case 'master': return <Flower2 size={60} color="var(--accent-secondary)" />;
            default: return null;
        }
    };

    const getStageName = (stage) => {
        switch (stage) {
            case 'seed': return 'Semilla';
            case 'sprout': return 'Brote';
            case 'young': return 'Planta Joven';
            case 'master': return 'Planta Maestra';
            default: return 'Vacío';
        }
    }

    return (
        <div style={{ padding: '2rem', marginLeft: '250px' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-gradient">Zen Garden</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Cultivate your focus. Max 10 slots.</p>
                </div>
                <button className="btn btn-secondary" onClick={() => setShowFusionModal(true)}>
                    <Beaker size={18} /> Laboratorio de Fusión
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
            }}>
                {/* We map exactly 10 slots */}
                {[...Array(10)].map((_, i) => {
                    const slot = garden.find(g => g.slot_index === i);
                    const isEmpty = !slot || slot.stage === 'empty';

                    return (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="glass-card"
                            style={{
                                height: '250px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1rem',
                                position: 'relative',
                                border: isEmpty ? '1px dashed var(--glass-border)' : '1px solid var(--glass-border)'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 10,
                                left: 10,
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)'
                            }}>
                                Slot {i + 1}
                            </div>

                            {isEmpty ? (
                                <>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <PlusIcon />
                                    </div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Plantar Semilla</span>
                                </>
                            ) : (
                                <>
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring' }}
                                        style={{ marginBottom: '1rem' }}
                                    >
                                        {getPlantVisual(slot.stage, slot.is_wilted)}
                                    </motion.div>
                                    <h4 style={{ color: slot.is_wilted ? 'var(--danger)' : 'var(--text-primary)' }}>
                                        {slot.seed_id || 'Unknown Plant'}
                                    </h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        {getStageName(slot.stage)}
                                    </p>
                                    <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px', marginTop: '1rem' }}>
                                        <div style={{ width: `${Math.min(100, (slot.tasks_completed_since_plant / 10) * 100)}%`, height: '100%', background: 'var(--accent-secondary)', borderRadius: '2px' }} />
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Progreso: {slot.tasks_completed_since_plant}/10 Tareas</p>
                                </>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Fusion Lab Modal Dummy */}
            <AnimatePresence>
                {showFusionModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(5px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel"
                            style={{ padding: '2rem', width: '500px', maxWidth: '90%' }}
                        >
                            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                <h3 className="text-gradient">Laboratorio de Fusión</h3>
                                <button onClick={() => setShowFusionModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                Fusiona semillas de menor rareza para obtener semillas superiores.
                            </p>
                            <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.8' }}>
                                <li>2 Comunes = 1 Rara</li>
                                <li>3 Raras = 1 Épica</li>
                                <li>4 Épicas = 1 Exótica</li>
                                <li>5 Exóticas = 1 Mercado Negro</li>
                            </ul>
                            <div style={{ textAlign: 'center' }}>
                                <p>Mecánica de fusión en construcción...</p>
                                {/* Future: Select seeds from inventory and click Fuse to subtract and give new seed */}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);
