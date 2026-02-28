import { LogOut, Home, CheckSquare, Flower2, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import PixelSprite from '../PixelSprite';

export default function Navbar() {
    const location = useLocation();
    const { inventory, profile, isGuest } = useGame();

    const handleLogout = async () => {
        if (isGuest) {
            localStorage.removeItem('questbloom_guest');
            window.location.href = '/auth';
        } else {
            await supabase.auth.signOut();
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
        { name: 'Bestiary (Tasks)', path: '/tasks', icon: <CheckSquare size={20} /> },
        { name: 'Zen Garden', path: '/garden', icon: <Flower2 size={20} /> },
        { name: 'Store', path: '/store', icon: <ShoppingBag size={20} /> },
    ];

    return (
        <nav className="glass-panel" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '250px',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
            borderLeft: 'none'
        }}>
            <div style={{ marginBottom: '3rem', padding: '0.5rem', width: 'auto' }}>
                <h2 className="text-gradient" style={{ fontSize: '1.2rem' }}>QuestBloom</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname.includes(item.path);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                color: isActive ? 'white' : 'var(--text-secondary)',
                                background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                                textDecoration: 'none',
                                transition: 'all var(--transition-fast)',
                                fontWeight: isActive ? 600 : 400
                            }}
                        >
                            <div style={{ color: isActive ? 'var(--accent-secondary)' : 'var(--text-muted)' }}>
                                {item.icon}
                            </div>
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* Inventory HUD (Pixel Art Top-Right equivalent, placed at bottom of nav for now or fixed top right?) 
                User requested top right HUD, but since we have a fixed left nav, we'll put it at the bottom of the nav 
                so it's always visible, or we could make it a fixed floating panel. Let's make it a fixed floating panel 
                top right over the main content area for better visibility.
            */}
            <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent', borderTop: 'var(--pixel-border)' }}
            >
                <LogOut size={16} />
                <span>EXIT</span>
            </button>

            {/* Floating Top-Right HUD */}
            <div className="glass-panel" style={{
                position: 'fixed',
                top: '1rem', right: '1rem',
                display: 'flex', gap: '1rem',
                padding: '0.5rem 1rem',
                zIndex: 1000,
                background: 'rgba(0, 0, 0, 0.6)',
                pointerEvents: 'none'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-tertiary)' }}>
                    <PixelSprite templateName="coin" baseColor="#fbbf24" scale={0.4} />
                    <span style={{ fontSize: '0.8rem' }}>{profile?.coins || 0}</span>
                </div>
                <div style={{ width: '2px', background: '#000' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--water)' }}>
                    <PixelSprite templateName="waterDrop" baseColor="#3b82f6" scale={0.4} />
                    <span style={{ fontSize: '0.8rem' }}>{inventory.find(i => i.item_name === 'Agua Destilada')?.quantity || 0}</span>
                </div>
                <div style={{ width: '2px', background: '#000' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                    <PixelSprite templateName="fertilizerBag" baseColor="#10b981" scale={0.4} />
                    <span style={{ fontSize: '0.8rem' }}>{inventory.find(i => i.item_name === 'Fertilizante Premium')?.quantity || 0}</span>
                </div>
                <div style={{ width: '2px', background: '#000' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-secondary)' }}>
                    <PixelSprite templateName="seed" baseColor="#a78bfa" scale={0.4} />
                    <span style={{ fontSize: '0.8rem' }}>{inventory.filter(i => i.item_type === 'seed').reduce((acc, curr) => acc + curr.quantity, 0)}</span>
                </div>
            </div>
        </nav>
    );
}
