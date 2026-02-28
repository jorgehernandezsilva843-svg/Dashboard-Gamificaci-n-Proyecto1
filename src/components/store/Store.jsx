import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Package, Droplets, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase } from '../../lib/supabase';
import { getRandomSeed } from '../../data/catalog';
import GameIcon from '../GameIcon';
import PixelSprite from '../PixelSprite';

export default function Store() {
    const { profile, loading, updateProfile, updateInventory } = useGame();
    const [purchasing, setPurchasing] = useState(false);
    const [gachaResult, setGachaResult] = useState(null);

    const triggerGacha = async () => {
        if (profile.coins < 100) {
            alert("No tienes suficientes monedas!");
            return;
        }

        setPurchasing(true);
        setGachaResult(null);

        // Simulate network/animation delay
        await new Promise(r => setTimeout(r, 1000));

        // Pick from catalog
        const seed = getRandomSeed();
        const rarity = seed.rarity;
        const seedName = seed.name;
        const color = seed.color;

        // Deduct coins and theoretically add to inventory
        if (profile.coins >= 100) {
            updateProfile({ coins: profile.coins - 100 });
            updateInventory(seedName, 1, 'seed', rarity);
        }

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: [color, '#ffffff']
        });

        setGachaResult({ rarity, seedName, color });
        setPurchasing(false);
    };

    const buyConsumable = async (price, name) => {
        if (profile.coins < price) {
            alert("No tienes suficientes monedas!");
            return;
        }
        updateProfile({ coins: profile.coins - price });
        updateInventory(name, 1, 'consumable', 'Común');
        alert(`Compraste: ${name}`);
    };

    return (
        <div style={{ padding: '2rem', marginLeft: '250px' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-gradient">El Refugio</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Tienda de suministros.</p>
                </div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#000' }}>
                    <GameIcon type="coin" scale={0.4} />
                    <strong>{profile?.coins || 0}</strong>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>

                {/* Distilled Water */}
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        <Droplets size={30} />
                    </div>
                    <h3>Agua Destilada</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'auto' }}>
                        Mantiene vivas tus plantas. Necesaria para que el temporizador de focus no se detenga.
                    </p>
                    <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => buyConsumable(10, 'Agua Destilada')}>
                        Comprar (10 <GameIcon type="coin" scale={0.3} />)
                    </button>
                </div>

                {/* Premium Fertilizer */}
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                        <Sparkles size={30} />
                    </div>
                    <h3>Fertilizante Premium</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'auto' }}>
                        Acelera el tiempo de crecimiento de un slot en 1 etapa.
                    </p>
                    <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => buyConsumable(50, 'Fertilizante Premium')}>
                        Comprar (50 <GameIcon type="coin" scale={0.3} />)
                    </button>
                </div>

                {/* Gacha Box */}
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid var(--accent-primary)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="animate-pulse-glow" style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 20px var(--accent-glow)' }}>
                            <Package size={40} />
                        </div>
                        <h3 className="text-gradient">Caja de Semillas</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'auto' }}>
                            Contiene una semilla aleatoria. ¡Incluso podría soltar una del Mercado Negro (0.1%)!
                        </p>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '0.5rem' }} onClick={triggerGacha} disabled={purchasing}>
                            {purchasing ? 'Abriendo...' : <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>Abrir Gacha (100 <GameIcon type="coin" scale={0.3} />)</span>}
                        </button>
                    </div>
                </div>

            </div>

            {/* Gacha Result Modal */}
            <AnimatePresence>
                {gachaResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="glass-panel"
                        style={{
                            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            zIndex: 1010, padding: '2rem', textAlign: 'center', border: `var(--pixel-border)`,
                            boxShadow: `0 0 40px ${gachaResult.color}80, var(--shadow-retro)`,
                            width: '90vw', maxWidth: '400px', background: 'var(--bg-secondary)'
                        }}
                    >
                        <h2 style={{ color: gachaResult.color, marginBottom: '1rem', fontSize: '1.2rem', textShadow: '2px 2px #000' }}>
                            ¡Wow!
                        </h2>
                        <div style={{
                            fontSize: '4rem', margin: '2rem auto',
                            background: '#000', width: '100px', height: '100px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `var(--pixel-border-sm)`, borderRadius: '0'
                        }}>
                            <PixelSprite templateName="seed" baseColor={gachaResult.color} scale={1.5} />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
                            {gachaResult.seedName}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.75rem' }}>
                            Rareza: <strong style={{ color: gachaResult.color }}>{gachaResult.rarity}</strong>
                        </p>
                        <button className="btn" style={{ background: gachaResult.color }} onClick={() => setGachaResult(null)}>
                            EQUIPAR
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Background Overlay */}
            {gachaResult && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000 }} onClick={() => setGachaResult(null)} />
            )}
        </div>
    );
}
