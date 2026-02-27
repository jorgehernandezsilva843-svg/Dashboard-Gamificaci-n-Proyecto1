import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Plus, CheckCircle, Circle, Skull, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskManager() {
    const { tasks, addTask, completeTask } = useGame();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subtasksCount, setSubtasksCount] = useState(0);

    const [activeCombat, setActiveCombat] = useState(null);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        await addTask({
            title,
            description,
            subtasks_count: Number(subtasksCount)
        });

        setTitle('');
        setDescription('');
        setSubtasksCount(0);
    };

    const handleComplete = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        setActiveCombat(task);

        // Simulate combat delay for animation
        setTimeout(async () => {
            await completeTask(taskId);
            setTimeout(() => setActiveCombat(null), 1000); // clear arena after death
        }, 1500);
    };

    return (
        <div style={{ padding: '2rem', marginLeft: '250px', display: 'flex', gap: '2rem' }}>

            {/* Left Column: Tasks List */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
                <h1 className="text-gradient" style={{ textShadow: '2px 2px #000' }}>Bestiary</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '-1rem' }}>Slay tasks to gain XP, Coins, and Items.</p>

                <form onSubmit={handleAddTask} className="pixel-corners" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-secondary)', border: 'var(--pixel-border)' }}>
                    <div className="input-group">
                        <label className="input-label">SUMMON NEW MONSTER (TASK)</label>
                        <input
                            className="input-field"
                            placeholder="NAME OF THE BEAST..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <textarea
                            className="input-field"
                            placeholder="LORE / DESCRIPTION (OPTIONAL)"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>
                    <div className="flex-between">
                        <div className="input-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center' }}>
                            <label className="input-label" style={{ marginRight: '1rem' }}>Difficulty (Subtasks):</label>
                            <input
                                type="number"
                                min="0"
                                className="input-field"
                                style={{ width: '60px', padding: '0.5rem' }}
                                value={subtasksCount}
                                onChange={e => setSubtasksCount(e.target.value)}
                            />
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>
                                (5+ = BOSS BATTLE)
                            </span>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                            [ INVOCAR ]
                        </button>
                    </div>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <AnimatePresence>
                        {tasks.filter(t => t.status === 'pending').map(task => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="pixel-corners"
                                style={{
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    background: 'var(--bg-tertiary)',
                                    border: 'var(--pixel-border-sm)',
                                    borderLeft: task.is_project ? '8px solid var(--danger)' : '8px solid var(--accent-primary)'
                                }}
                            >
                                <button
                                    onClick={() => handleComplete(task.id)}
                                    className="btn"
                                    style={{ padding: '0.5rem', fontSize: '1rem' }}
                                    title="Attack / Complete"
                                >
                                    ⚔️
                                </button>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                                        {task.title}
                                    </h3>
                                    {task.description && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{task.description}</p>}
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '0.7rem' }}>
                                    <div style={{ color: task.is_project ? 'var(--danger)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', marginBottom: '0.2rem' }}>
                                        {task.is_project ? '👹' : '👾'}
                                        {task.monster_name}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)' }}>HP: {task.hp} / {task.hp}</div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {tasks.filter(t => t.status === 'pending').length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                            The forest is peaceful. No monsters in sight.
                        </p>
                    )}
                </div>
            </div>

            {/* Right Column: Active Combat Arena */}
            <div style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
                <h2 className="text-gradient" style={{ marginBottom: '1.5rem', textShadow: '2px 2px #000' }}>Combat Arena</h2>
                <div className="pixel-corners" style={{
                    flex: 1, maxHeight: '500px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', position: 'relative',
                    overflow: 'hidden', background: '#000', border: 'var(--pixel-border)',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0V0zm20 20h20v20H20V20z\' fill=\'%230f172a\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'
                }}>

                    <AnimatePresence>
                        {activeCombat ? (
                            <motion.div
                                key="monster"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [1, 1.1, 1, 1.05, 1],
                                    opacity: 1,
                                    rotate: [0, -5, 5, -5, 0] // Shake effect
                                }}
                                exit={{
                                    scale: 0,
                                    opacity: 0,
                                    filter: 'brightness(200%)' // Flash before dying
                                }}
                                transition={{ duration: 0.5 }}
                                style={{ textAlign: 'center' }}
                            >
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    background: 'transparent',
                                    margin: '0 auto 1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '6rem',
                                    filter: activeCombat.is_project ? 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))' : 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))'
                                }}>
                                    {activeCombat.is_project ? '👹' : '👾'}
                                </div>
                                <h3>{activeCombat.monster_name}</h3>
                                <div style={{
                                    width: '100%',
                                    height: '12px',
                                    background: '#333',
                                    border: '2px solid #555',
                                    marginTop: '1rem',
                                    position: 'relative'
                                }}>
                                    <motion.div
                                        initial={{ width: '100%' }}
                                        animate={{ width: '0%' }} // Drain HP
                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                        style={{ height: '100%', background: 'var(--danger)' }}
                                    />
                                </div>
                                <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Taking Damage...</p>
                            </motion.div>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🛡️</div>
                                <p>AWAITING COMBAT</p>
                            </div>
                        )}
                    </AnimatePresence>

                </div>
            </div>

        </div>
    );
}
