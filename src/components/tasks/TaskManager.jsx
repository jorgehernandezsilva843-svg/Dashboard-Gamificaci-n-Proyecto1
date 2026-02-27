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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h1 className="text-gradient">Bestiary (Tasks)</h1>

                <form onSubmit={handleAddTask} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="input-group">
                        <label className="input-label">Summon New Monster (Task)</label>
                        <input
                            className="input-field"
                            placeholder="Task Title..."
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <textarea
                            className="input-field"
                            placeholder="Description (Optional)"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>
                    <div className="flex-between">
                        <div className="input-group" style={{ marginBottom: 0, flexDirection: 'row', alignItems: 'center' }}>
                            <label className="input-label" style={{ marginRight: '1rem' }}>Subtasks Count:</label>
                            <input
                                type="number"
                                min="0"
                                className="input-field"
                                style={{ width: '80px' }}
                                value={subtasksCount}
                                onChange={e => setSubtasksCount(e.target.value)}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '1rem' }}>
                                (5+ Subtasks invokes a Boss!)
                            </span>
                        </div>
                        <button type="submit" className="btn btn-primary">
                            <Plus size={16} /> Summon
                        </button>
                    </div>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <AnimatePresence>
                        {tasks.filter(t => t.status === 'pending').map(task => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass-card"
                                style={{
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    borderLeft: task.is_project ? '4px solid var(--danger)' : '4px solid var(--accent-primary)'
                                }}
                            >
                                <button
                                    onClick={() => handleComplete(task.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                    title="Attack / Complete"
                                >
                                    <Circle size={24} />
                                </button>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                                        {task.title}
                                    </h3>
                                    {task.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{task.description}</p>}
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                                    <div style={{ color: task.is_project ? 'var(--danger)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                                        {task.is_project ? <Skull size={14} /> : <Zap size={14} />}
                                        {task.monster_name}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)' }}>HP: {task.hp}</div>
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
            <div style={{ width: '350px' }}>
                <h2 className="text-gradient" style={{ marginBottom: '1.5rem' }}>Combat Arena</h2>
                <div className="glass-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

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
                                    borderRadius: '50%',
                                    background: activeCombat.is_project ? 'linear-gradient(135deg, #ef4444, #7f1d1d)' : 'linear-gradient(135deg, #8b5cf6, #4c1d95)',
                                    margin: '0 auto 1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: activeCombat.is_project ? '0 0 30px rgba(239, 68, 68, 0.5)' : 'var(--shadow-glow)',
                                    fontSize: '3rem'
                                }}>
                                    {activeCombat.is_project ? '👹' : '👾'}
                                </div>
                                <h3>{activeCombat.monster_name}</h3>
                                <div style={{
                                    width: '100%',
                                    height: '10px',
                                    background: 'var(--glass-border)',
                                    borderRadius: '5px',
                                    marginTop: '1rem',
                                    overflow: 'hidden'
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
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p>Select a task to enter combat</p>
                            </div>
                        )}
                    </AnimatePresence>

                </div>
            </div>

        </div>
    );
}
