import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Plus, CheckCircle, Circle, Skull, Zap, FileText, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelSprite from '../PixelSprite';

export default function TaskManager() {
    const { tasks, addTask, completeTask, updateTask, deleteTask } = useGame();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subtasksCount, setSubtasksCount] = useState(0);

    const [activeCombat, setActiveCombat] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskNote, setTaskNote] = useState('');

    const handleOpenModal = (task) => {
        setSelectedTask(task);
        setTaskNote(task.notes || '');
    };

    const handleSaveNote = () => {
        if (selectedTask) {
            updateTask(selectedTask.id, { notes: taskNote });
            setSelectedTask(null);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("¿Seguro que quieres eliminar este monstruo definitivamente?")) {
            deleteTask(id);
            setSelectedTask(null);
        }
    };

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
                                onClick={() => handleOpenModal(task)}
                                style={{
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    background: '#0f172a', // Deep navy blue
                                    border: '4px solid #1e293b',
                                    borderLeft: task.is_project ? '8px solid var(--danger)' : '8px solid var(--accent-primary)',
                                    cursor: 'pointer',
                                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5), 4px 4px 0px 0px rgba(0, 0, 0, 0.5)'
                                }}
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleComplete(task.id); }}
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
                                    <div style={{ color: task.monster_color || (task.is_project ? 'var(--danger)' : 'var(--warning)'), display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', marginBottom: '0.2rem' }}>
                                        <span style={{ filter: `drop-shadow(0 0 5px ${task.monster_color || '#fff'})` }}>
                                            <PixelSprite templateName={task.monster_sprite || (task.is_project ? 'boss_default' : 'slime')} baseColor={task.monster_color || '#fff'} scale={0.5} />
                                        </span>
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

                {/* Salón de los Caídos (Completed Tasks) */}
                <div style={{ marginTop: '2rem' }}>
                    <h2 className="text-gradient" style={{ textShadow: '2px 2px #000', fontSize: '1.2rem' }}>El Salón de los Caídos</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.8rem' }}>Bestiario de Victorias.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                        {tasks.filter(t => t.status === 'completed').map(task => (
                            <div
                                key={task.id}
                                className="pixel-corners glass-card"
                                onClick={() => handleOpenModal(task)}
                                style={{
                                    cursor: 'pointer',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    filter: 'grayscale(100%) opacity(0.7)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <span style={{ filter: `drop-shadow(0 0 5px #fff)` }}>
                                    <PixelSprite templateName={task.monster_sprite || (task.is_project ? 'boss_default' : 'slime')} baseColor={'#fff'} scale={0.6} />
                                </span>
                                <div style={{ fontSize: '0.55rem', color: 'var(--danger)', fontWeight: 'bold', border: '1px solid var(--danger)', padding: '2px 4px', background: '#000' }}>[ DERROTADO ]</div>
                                <h4 style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{task.title}</h4>
                            </div>
                        ))}
                        {tasks.filter(t => t.status === 'completed').length === 0 && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ningún monstruo ha sido derrotado aún.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column: Active Combat Arena */}
            <div style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
                <h2 className="text-gradient" style={{ marginBottom: '1.5rem', textShadow: '2px 2px #000' }}>Combat Arena</h2>
                <div className="pixel-corners" style={{
                    flex: 1, maxHeight: '500px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', position: 'relative',
                    overflow: 'hidden', background: '#020617', border: '6px double #334155',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 6px 6px 0px 0px rgba(0, 0, 0, 0.5)',
                    backgroundImage: 'repeating-linear-gradient(45deg, #0f172a 25%, transparent 25%, transparent 75%, #0f172a 75%, #0f172a), repeating-linear-gradient(45deg, #0f172a 25%, #020617 25%, #020617 75%, #0f172a 75%, #0f172a)',
                    backgroundPosition: '0 0, 10px 10px',
                    backgroundSize: '20px 20px'
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
                                <div className={activeCombat.monster_style || ''} style={{
                                    width: '120px',
                                    height: '120px',
                                    background: 'transparent',
                                    margin: '0 auto 1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    filter: `drop-shadow(0 0 15px ${activeCombat.monster_color || (activeCombat.is_project ? 'rgba(239, 68, 68, 0.8)' : 'rgba(139, 92, 246, 0.5)')})`
                                }}>
                                    <PixelSprite templateName={activeCombat.monster_sprite || (activeCombat.is_project ? 'boss_default' : 'slime')} baseColor={activeCombat.monster_color || '#fff'} scale={2} />
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

            {/* Task Notes / Edit Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', zIndex: 1100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-panel"
                            style={{ width: '90%', maxWidth: '500px', padding: '2rem', background: 'var(--bg-primary)' }}
                        >
                            <div className="flex-between" style={{ marginBottom: '1.5rem', borderBottom: 'var(--pixel-border-sm)', paddingBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ filter: `drop-shadow(0 0 5px ${selectedTask.monster_color || '#fff'})` }}>
                                        <PixelSprite templateName={selectedTask.monster_sprite || 'slime'} baseColor={selectedTask.monster_color || '#fff'} scale={0.6} />
                                    </span>
                                    <div>
                                        <h3 style={{ color: selectedTask.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: selectedTask.status === 'completed' ? 'line-through' : 'none' }}>
                                            {selectedTask.title}
                                        </h3>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{selectedTask.monster_name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTask(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="input-group">
                                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={14} /> APUNTES / NOTAS DE LA TAREA
                                </label>
                                <textarea
                                    className="input-field"
                                    rows="6"
                                    value={taskNote}
                                    onChange={(e) => setTaskNote(e.target.value)}
                                    placeholder="Escribe aquí los detalles, links o apuntes relacionados a esta tarea..."
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div className="flex-between" style={{ marginTop: '2rem' }}>
                                <button className="btn" style={{ background: 'var(--danger)', color: 'white' }} onClick={() => handleDelete(selectedTask.id)}>
                                    <Trash2 size={16} /> [ BORRAR ]
                                </button>
                                <button className="btn btn-primary" onClick={handleSaveNote}>
                                    [ GUARDAR ]
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
