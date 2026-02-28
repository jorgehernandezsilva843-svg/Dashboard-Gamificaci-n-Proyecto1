import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Flower2, Beaker, Sprout, Trees } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEED_CATALOG } from '../../data/catalog';
import PixelSprite from '../PixelSprite';
import { Trash2 } from 'lucide-react';

export default function Garden() {
    const { garden, loading, inventory, updateInventory, setGarden, saveToLocal, isGuest, removePlant, syncGarden } = useGame();
    const [showFusionModal, setShowFusionModal] = useState(false);

    const handleSlotClick = async (slotIndex) => {
        const slot = garden.find(g => g.slot_index === slotIndex);
        if (!slot) return;

        if (slot.needs_water) {
            const waterItem = inventory.find(i => i.item_name === 'Agua Destilada');
            if (waterItem && waterItem.quantity > 0) {
                await updateInventory('Agua Destilada', -1, 'consumable', 'Común');
                const updatedGarden = garden.map(g => g.slot_index === slotIndex ? { ...g, needs_water: false } : g);
                await syncGarden(updatedGarden);
            } else {
                alert('¡No tienes Agua Destilada! Compra en la tienda.');
            }
            return;
        }

        if (slot.stage === 'empty') {
            const seeds = inventory.filter(i => i.item_type === 'seed');
            if (seeds.length === 0) {
                alert('¡No tienes semillas! Consigue una en la tienda.');
                return;
            }
            const seedToPlant = seeds[0];
            await updateInventory(seedToPlant.item_name, -1, 'seed', seedToPlant.rarity);

            let updatedGarden = [...garden];
            let targetSlotIndex = updatedGarden.findIndex(g => g.slot_index === slotIndex);

            if (targetSlotIndex !== -1) {
                updatedGarden[targetSlotIndex] = {
                    ...updatedGarden[targetSlotIndex],
                    stage: 'seed',
                    seed_id: seedToPlant.item_name,
                    tasks_completed_since_plant: 0,
                    needs_water: false,
                    is_wilted: false
                };
            } else {
                updatedGarden.push({
                    slot_index: slotIndex,
                    stage: 'seed',
                    seed_id: seedToPlant.item_name,
                    tasks_completed_since_plant: 0,
                    needs_water: false,
                    is_wilted: false
                });
            }

            await syncGarden(updatedGarden);
        }
    };

    const handleRemovePlant = async (e, slotIndex) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de arrancar esta planta? Se perderá para siempre y no podrás recuperarla.')) {
            await removePlant(slotIndex);
        }
    };

    // Helper to map stage to an icon/emoji
    const getPlantVisual = (stage, isWilted, seedId) => {
        if (isWilted) return <div style={{ filter: 'grayscale(100%)', opacity: 0.5 }}><PixelSprite templateName="flower" baseColor="#555555" scale={2} /></div>;

        let visualTemplate = 'seed';
        let color = '#ffffff';
        let isMaster = stage === 'master';

        if (seedId) {
            const seedInfo = SEED_CATALOG.find(s => s.name === seedId);
            if (seedInfo && seedInfo.sprites && seedInfo.sprites[stage]) {
                visualTemplate = seedInfo.sprites[stage];
                color = seedInfo.color;
            }
        } else {
            // Fallback
            switch (stage) {
                case 'seed': visualTemplate = 'seed'; break;
                case 'sprout': visualTemplate = 'sprout'; break;
                case 'young': visualTemplate = 'sprout'; break;
                case 'master': visualTemplate = 'flower'; break;
            }
        }

        let scale = 1;
        if (stage === 'sprout') scale = 1.25;
        if (stage === 'young') scale = 1.75;
        if (stage === 'master') scale = 2.5;

        return (
            <motion.div
                animate={isMaster ? { y: [0, -5, 0] } : {}}
                transition={isMaster ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
                style={{
                    display: 'inline-block',
                    filter: isMaster ? `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 15px ${color})` : `drop-shadow(2px 2px 0px #000)`
                }}
            >
                <PixelSprite templateName={visualTemplate} baseColor={color} scale={scale} />
            </motion.div>
        );
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
        <div className="main-content">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-gradient">Zen Garden</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Cultiva tu enfoque. Máximo 10 parcelas.</p>
                </div>
                <button className="btn btn-secondary" onClick={() => setShowFusionModal(true)}>
                    [ LABORATORIO ]
                </button>
            </div>

            <div className="garden-grid">
                {/* We map exactly 10 slots */}
                {[...Array(10)].map((_, i) => {
                    const slot = garden.find(g => g.slot_index === i);
                    const isEmpty = !slot || slot.stage === 'empty';

                    return (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            onClick={() => handleSlotClick(i)}
                            className="pixel-corners"
                            style={{
                                height: '180px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1rem',
                                position: 'relative',
                                background: isEmpty ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                                border: 'var(--pixel-border-sm)',
                                cursor: isEmpty ? 'pointer' : 'default',
                                backgroundImage: isEmpty ? 'none' : 'repeating-linear-gradient(45deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 4px)',
                                boxShadow: isEmpty ? 'none' : 'inset 0 -10px 0 rgba(0,0,0,0.5)' // Gives a 3D dirt look at the bottom
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 5,
                                left: 5,
                                fontSize: '0.6rem',
                                color: 'var(--text-muted)',
                                background: '#000',
                                padding: '2px 4px'
                            }}>
                                [ {i + 1} ]
                            </div>

                            {/* Water icon indicator if needed */}
                            {!isEmpty && slot.needs_water && (
                                <div style={{ position: 'absolute', top: 5, right: 5, cursor: 'help' }} title="¡Necesita agua o morirá pronto!">
                                    <div className="animate-pulse-glow">
                                        <PixelSprite templateName="waterDrop" baseColor="#3B82F6" scale={0.6} />
                                    </div>
                                </div>
                            )}

                            {isEmpty ? (
                                <>
                                    <div style={{ width: '40px', height: '40px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', border: 'var(--pixel-border-sm)', color: 'var(--text-muted)' }}>
                                        +
                                    </div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>PLANTAR</span>
                                </>
                            ) : (
                                <>
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring' }}
                                        style={{ marginBottom: '0.5rem', zIndex: 1 }}
                                    >
                                        {getPlantVisual(slot.stage, slot.is_wilted, slot.seed_id)}
                                    </motion.div>
                                    <h4 style={{ color: slot.is_wilted ? 'var(--danger)' : 'var(--text-primary)', fontSize: '0.75rem', textAlign: 'center', zIndex: 1, textShadow: '1px 1px #000' }}>
                                        {slot.seed_id || 'Unknown Plant'}
                                    </h4>

                                    <div style={{ width: '80%', background: '#000', height: '6px', marginTop: '0.5rem', border: '1px solid #333' }}>
                                        <div style={{ width: `${Math.min(100, (slot.tasks_completed_since_plant / 10) * 100)}%`, height: '100%', background: 'var(--accent-secondary)' }} />
                                    </div>

                                    <button
                                        onClick={(e) => handleRemovePlant(e, i)}
                                        style={{
                                            position: 'absolute',
                                            bottom: 5,
                                            right: 5,
                                            background: '#ef4444', // Red
                                            border: 'var(--pixel-border-sm)',
                                            color: '#fff',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            padding: 0,
                                            zIndex: 5
                                        }}
                                        title="Arrancar planta"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Fusion Lab Modal Dummy */}
            <AnimatePresence>
                {showFusionModal && (
                    <div className="modal-backdrop-fixed">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel modal-content-relative"
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
