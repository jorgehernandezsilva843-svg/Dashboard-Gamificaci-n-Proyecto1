export default function Dashboard({ session }) {
    return (
        <div style={{ padding: '2rem', marginLeft: '250px' }}>
            <h1>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {session?.user?.email}</p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginTop: '2rem'
            }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3>Stats</h3>
                    <p>Level: 1</p>
                    <p>XP: 0 / 1000</p>
                    <p>Coins: 0</p>
                </div>
            </div>
        </div>
    );
}
