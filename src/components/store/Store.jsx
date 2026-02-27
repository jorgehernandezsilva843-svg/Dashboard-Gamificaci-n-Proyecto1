import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Package, Droplets, Sparkles, Gem } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase } from '../../lib/supabase';

export default function Store() {
    const { profile, loading } = useGame();
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

        const rand = Math.random() * 100;
        let rarity = '';
        let seedName = '';
        let color = '';

        if (rand <= 0.1) {
            rarity = 'Mercado Negro';
            seedName = 'Árbol del Tiempo Suspendido';
            color = '#ef4444'; // Red/Galaxy
        } else if (rand <= 5) { // 4.9 + 0.1
            rarity = 'Exótica';
            seedName = 'Cactus de Plasma';
            color = '#f59e0b'; // Gold
        } else if (rand <= 25) { // 20 + 5
            rarity = 'Épica';
            seedName = 'Girasol de Oro de 24k';
            color = '#c084fc'; // Purple
        } else if (rand <= 50) { // 25 + 25
            rarity = 'Rara';
            seedName = 'Bonsái de Enebro';
            color = '#3b82f6'; // Blue
        } else { // remaining 50%
            rarity = 'Común';
            seedName = 'Margarita Blanca';
            color = '#94a3b8'; // Grey
        }

        // Deduct coins and theoretically add to inventory
        // await supabase.from('profiles').update({ coins: profile.coins - 100 }).eq('id', profile.id);

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
        // Logic to buy consumable
        alert(`Compraste: ${name}`);
    };

    return (
        <div style={{ padding: '2rem', marginLeft: '250px' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-gradient">El Refugio del Jardinero</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Compra suministros y semillas misteriosas con tus Monedas.</p>
                </div>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Gem size={18} color="var(--warning)" />
                    <strong>{profile?.coins || 0} Monedas</strong>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>

                {/* Distilled Water */}
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Droplets size={30} />
                    </div>
                    <h3>Agua Destilada</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '1rem 0', height: '60px' }}>
                        Mantiene vivas tus plantas. Necesaria para que el temporizador de focus no se detenga.
                    </p>
                    <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => buyConsumable(10, 'Agua Destilada')}>
                        Comprar (10 <Gem size={14} />)
                    </button>
                </div>

                {/* Premium Fertilizer */}
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Sparkles size={30} />
                    </div>
                    <h3>Fertilizante Premium</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '1rem 0', height: '60px' }}>
                        Acelera el tiempo de crecimiento de un slot en 1 etapa.
                    </p>
                    <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => buyConsumable(50, 'Fertilizante Premium')}>
                        Comprar (50 <Gem size={14} />)
                    </button>
                </div>

                {/* Gacha Box */}
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid var(--accent-primary)', position: 'relative', overflow: 'hidden' }}>
                    <div className="animate-pulse-glow" style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 20px var(--accent-glow)' }}>
                            <Package size={40} />
                        </div>
                        <h3 className="text-gradient">Caja de Semillas</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '1rem 0', height: '60px' }}>
                            Contiene una semilla aleatoria. ¡Incluso podría soltar una del Mercado Negro (0.1%)!
                        </p>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={triggerGacha} disabled={purchasing}>
                            {purchasing ? 'Abriendo...' : 'Abrir Gacha (100 \uD83D\uDC8E)'}
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
                            zIndex: 1000, padding: '3rem', textAlign: 'center', border: `2px solid ${gachaResult.color}`,
                            boxShadow: `0 0 40px ${gachaResult.color}40`, width: '400px'
                        }}
                    >
                        <h2 style={{ color: gachaResult.color, marginBottom: '1rem' }}>¡Has obtenido una Mística!</h2>
                        <div style={{ fontSize: '4rem', margin: '2rem 0' }}>🌱</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>{gachaResult.seedName}</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Rareza: <strong>{gachaResult.rarity}</strong></p>
                        <button className="btn btn-primary" onClick={() => setGachaResult(null)}>Genial</button>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Background Overlay */}
            {gachaResult && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 999 }} onClick={() => setGachaResult(null)} />
            )}
        </div>
    );
}
