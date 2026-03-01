import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useModal } from '../../context/ModalContext';
import { Flower2, Beaker, Sprout, Trees } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEED_CATALOG, getRandomSeedByRarity } from '../../data/catalog';
import PixelSprite from '../PixelSprite';
import { Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Garden() {
    const { garden, loading, inventory, updateInventory, executeFusion, setGarden, saveToLocal, isGuest, removePlant, syncGarden } = useGame();
    const { showAlert, showConfirm } = useModal();
    const [showFusionModal, setShowFusionModal] = useState(false);
    const [fusing, setFusing] = useState(false);
    const [fusionResult, setFusionResult] = useState(null);
    const [isSeedMenuOpen, setIsSeedMenuOpen] = useState(false);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

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
                await showAlert('¡No tienes Agua Destilada! Compra en la tienda.', 'AGUA INSUFICIENTE');
            }
            return;
        }

        if (slot.needs_fertilizer) {
            const fertItem = inventory.find(i => i.item_name === 'Fertilizante Premium');
            if (fertItem && fertItem.quantity > 0) {
                await updateInventory('Fertilizante Premium', -1, 'consumable', 'Común');
                const updatedGarden = garden.map(g => g.slot_index === slotIndex ? { ...g, needs_fertilizer: false } : g);
                await syncGarden(updatedGarden);
            } else {
                await showAlert('¡No tienes Fertilizante Premium! Compra en la tienda.', 'FERTILIZANTE INSUFICIENTE');
            }
            return;
        }

        if (slot.stage === 'empty') {
            const seeds = inventory.filter(i => i.item_type === 'seed' && i.quantity > 0);
            if (seeds.length === 0) {
                await showAlert('Tu bolsa está vacía. Consigue semillas en la tienda.', 'SIN SEMILLAS');
                return;
            }
            setSelectedSlotIndex(slotIndex);
            setIsSeedMenuOpen(true);
        }
    };

    const confirmPlanting = async (seedToPlant) => {
        // Find seed color/rarity info
        let r = seedToPlant.rarity;
        if (!r) {
            const found = SEED_CATALOG.find(s => s.name === seedToPlant.item_name);
            r = found ? found.rarity : 'Común';
        }

        await updateInventory(seedToPlant.item_name, -1, 'seed', r);

        let updatedGarden = [...garden];
        let targetSlotIndex = updatedGarden.findIndex(g => g.slot_index === selectedSlotIndex);

        if (targetSlotIndex !== -1) {
            updatedGarden[targetSlotIndex] = {
                ...updatedGarden[targetSlotIndex],
                stage: 'seed',
                seed_id: seedToPlant.item_name,
                tasks_completed_since_plant: 0,
                needs_water: false,
                is_wilted: false,
                needs_fertilizer: false
            };
        } else {
            updatedGarden.push({
                slot_index: selectedSlotIndex,
                stage: 'seed',
                seed_id: seedToPlant.item_name,
                tasks_completed_since_plant: 0,
                needs_water: false,
                is_wilted: false,
                needs_fertilizer: false
            });
        }

        await syncGarden(updatedGarden);
        setIsSeedMenuOpen(false);
        setSelectedSlotIndex(null);
    };

    const getSeedCountByRarity = (rarity) => {
        const normalizedRarity = rarity.toLowerCase().trim();
        return inventory
            .filter(i => {
                if (i.item_type !== 'seed') return false;
                let r = i.rarity;
                if (!r) {
                    const found = SEED_CATALOG.find(s => s.name === i.item_name);
                    r = found ? found.rarity : '';
                }
                return r && r.toLowerCase().trim() === normalizedRarity;
            })
            .reduce((sum, i) => sum + i.quantity, 0);
    };

    const handleFusion = async (sourceRarity, cost, targetRarity) => {
        const count = getSeedCountByRarity(sourceRarity);
        if (count < cost) {
            await showAlert(`Necesitas ${cost} semillas de rareza [${sourceRarity}] para esta fusión. Tienes: ${count}`, 'MATERIAL INSUFICIENTE');
            return;
        }

        setFusing(true);
        setFusionResult(null);

        // Simulate animation delay
        await new Promise(r => setTimeout(r, 1000));

        const newSeed = getRandomSeedByRarity(targetRarity);

        await executeFusion(sourceRarity, cost, newSeed);

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: [newSeed.color, '#ffffff']
        });

        setFusionResult({ rarity: targetRarity, seedName: newSeed.name, color: newSeed.color });
        setFusing(false);
        setShowFusionModal(false);
    };

    const handleRemovePlant = async (e, slotIndex) => {
        e.stopPropagation();
        const conf = await showConfirm('¿Estás seguro de arrancar esta planta? Se perderá para siempre y no podrás recuperarla.', 'ARRANCAR PLANTA');
        if (conf) {
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

                            {/* Fertilizer icon indicator if needed */}
                            {!isEmpty && slot.needs_fertilizer && !slot.needs_water && (
                                <div style={{ position: 'absolute', top: 5, right: 5, cursor: 'help' }} title="¡Necesita fertilizante para crecer!">
                                    <div className="animate-pulse-glow">
                                        <PixelSprite templateName="fertilizerBag" baseColor="#10b981" scale={0.6} />
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
                                Fusiona semillas de menor rareza para transmutarlas en semillas superiores aleatorias.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <button className="btn" style={{ background: '#3b82f6', opacity: fusing ? 0.5 : 1 }} onClick={() => handleFusion('Común', 2, 'Rara')} disabled={fusing}>
                                    {fusing ? 'FUSIONANDO...' : `[ 2 COMUNES ] ➔ 1 RARA (Tienes ${getSeedCountByRarity('Común')})`}
                                </button>
                                <button className="btn" style={{ background: '#fbbf24', color: '#000', opacity: fusing ? 0.5 : 1 }} onClick={() => handleFusion('Rara', 3, 'Épica')} disabled={fusing}>
                                    {fusing ? 'FUSIONANDO...' : `[ 3 RARAS ] ➔ 1 ÉPICA (Tienes ${getSeedCountByRarity('Rara')})`}
                                </button>
                                <button className="btn" style={{ background: '#ec4899', color: 'white', opacity: fusing ? 0.5 : 1 }} onClick={() => handleFusion('Épica', 4, 'Exótica')} disabled={fusing}>
                                    {fusing ? 'FUSIONANDO...' : `[ 4 ÉPICAS ] ➔ 1 EXÓTICA (Tienes ${getSeedCountByRarity('Épica')})`}
                                </button>
                                <button className="btn" style={{ background: '#581c87', color: 'white', opacity: fusing ? 0.5 : 1 }} onClick={() => handleFusion('Exótica', 5, 'Mercado Negro')} disabled={fusing}>
                                    {fusing ? 'FUSIONANDO...' : `[ 5 EXÓTICAS ] ➔ 1 MERC. NEGRO (Tienes ${getSeedCountByRarity('Exótica')})`}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Fusion Result Modal */}
            <AnimatePresence>
                {fusionResult && (
                    <div className="modal-backdrop-fixed" onClick={() => setFusionResult(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="glass-panel modal-content-relative"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                padding: '2rem', textAlign: 'center', border: `var(--pixel-border)`,
                                boxShadow: `0 0 40px ${fusionResult.color}80, var(--shadow-retro)`,
                                width: '90vw', maxWidth: '400px', background: 'var(--bg-secondary)'
                            }}
                        >
                            <h2 style={{ color: fusionResult.color, marginBottom: '1rem', fontSize: '1.2rem', textShadow: '2px 2px #000' }}>
                                ¡Fusión Exitosa!
                            </h2>
                            <div style={{
                                fontSize: '4rem', margin: '2rem auto',
                                background: '#000', width: '100px', height: '100px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `var(--pixel-border-sm)`, borderRadius: '0'
                            }}>
                                <PixelSprite templateName="seed" baseColor={fusionResult.color} scale={1.5} />
                            </div>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                {fusionResult.seedName}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.75rem' }}>
                                Rareza Resultante: <strong style={{ color: fusionResult.color }}>{fusionResult.rarity}</strong>
                            </p>
                            <button className="btn" style={{ background: fusionResult.color }} onClick={() => setFusionResult(null)}>
                                ALMACENAR
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Seed Inventory Selection Modal */}
            <AnimatePresence>
                {isSeedMenuOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm w-screen h-screen overflow-hidden" onClick={() => setIsSeedMenuOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 50 }}
                            className="relative z-[101] max-w-[90vw] max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                padding: '2rem',
                                border: `var(--pixel-border)`,
                                background: 'var(--bg-secondary)',
                                boxShadow: `var(--shadow-retro)`,
                                width: '400px',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <h2 className="text-gradient" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', textAlign: 'center' }}>
                                [ INVENTARIO DE SEMILLAS ]
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {inventory
                                    .filter(i => i.item_type === 'seed' && i.quantity > 0)
                                    .map(seed => {
                                        const catalogInfo = SEED_CATALOG.find(s => s.name === seed.item_name) || { color: '#ffffff' };
                                        return (
                                            <button
                                                key={seed.item_name}
                                                className="btn btn-secondary"
                                                onClick={() => confirmPlanting(seed)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.8rem',
                                                    width: '100%',
                                                    background: '#111',
                                                    border: `2px solid ${catalogInfo.color}`,
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <PixelSprite templateName="seed" baseColor={catalogInfo.color} scale={0.6} />
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', color: catalogInfo.color }}>
                                                        {seed.item_name}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    x{seed.quantity}
                                                </span>
                                            </button>
                                        );
                                    })}
                            </div>

                            <button
                                className="btn"
                                style={{ marginTop: '1.5rem', background: '#eab308', color: '#000', width: '100%' }}
                                onClick={() => setIsSeedMenuOpen(false)}
                            >
                                CANCELAR
                            </button>
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
