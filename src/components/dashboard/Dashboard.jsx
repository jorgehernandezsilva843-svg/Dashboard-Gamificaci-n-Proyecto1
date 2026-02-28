import { useGame } from '../../context/GameContext';

export default function Dashboard({ session }) {
    const { profile } = useGame();

    return (
        <div style={{ padding: '2rem', marginLeft: '250px' }}>
            <h1>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
                Welcome back, <span className="text-gradient" style={{ fontWeight: 'bold' }}>{profile?.username || session?.user?.email}</span>
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginTop: '2rem'
            }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3>Stats</h3>
                    <p>Level: {profile?.level || 1}</p>
                    <p>XP: {profile?.xp || 0} / {(profile?.level || 1) * 1000}</p>
                    <p>Coins: {profile?.coins || 0}</p>
                </div>
            </div>
        </div>
    );
}
