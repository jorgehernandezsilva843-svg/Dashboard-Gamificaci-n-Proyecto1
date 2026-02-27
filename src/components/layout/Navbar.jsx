import { LogOut, Home, CheckSquare, Flower2, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();

    const handleLogout = async () => {
        // We can add slide-out animation via Framer Motion wrapping the app later.
        await supabase.auth.signOut();
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
            <div style={{ marginBottom: '3rem' }}>
                <h2 className="text-gradient">Proyecto U1</h2>
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

            <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start' }}
            >
                <LogOut size={18} />
                <span>Logout</span>
            </button>
        </nav>
    );
}
