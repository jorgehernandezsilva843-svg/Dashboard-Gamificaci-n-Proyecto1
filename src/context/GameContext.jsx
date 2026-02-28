import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getRandomDailyMonster, getRandomBossMonster } from '../data/bestiary';

const GameContext = createContext();

export function GameProvider({ children, session }) {
    const [profile, setProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [garden, setGarden] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    // Helpers to persist and load local data
    const saveToLocal = (key, data) => localStorage.setItem(`questbloom_${key}`, JSON.stringify(data));
    const loadFromLocal = (key, defaultVal) => {
        const stored = localStorage.getItem(`questbloom_${key}`);
        return stored ? JSON.parse(stored) : defaultVal;
    };

    useEffect(() => {
        if (session?.user?.id === 'guest-user') {
            setIsGuest(true);
            loadMockData();
        } else if (session?.user) {
            setIsGuest(false);
            fetchData();
        }
    }, [session]);

    const loadMockData = () => {
        console.warn("QuestBloom: Running in LocalStorage/Guest Mode.");
        setLoading(true);

        // Load from local storage or set initial defaults
        const localProfile = loadFromLocal('profile', { id: 'guest-user', email: 'guest@questbloom.com', xp: 450, coins: 150, level: 5 });
        const localTasks = loadFromLocal('tasks', [
            { id: 't1', title: 'Completar prototipo UI', description: 'Terminar el rediseño de la app', is_project: true, subtasks_count: 5, monster_type: 'boss_cronos', monster_name: 'Cronos, el Devorador de Plazos', hp: 500, status: 'pending' },
            { id: 't2', title: 'Hacer ejercicio 30 min', description: 'Cardio ligero', is_project: false, subtasks_count: 0, monster_type: 'daily', monster_name: 'Slime de la Procrastinación', hp: 100, status: 'pending' }
        ]);
        const localGarden = loadFromLocal('garden', [
            { slot_index: 0, seed_id: 'Margarita Común', stage: 'master', tasks_completed_since_plant: 10, is_wilted: false, needs_water: false },
            { slot_index: 1, seed_id: 'Bonsái Galáctico', stage: 'young', tasks_completed_since_plant: 7, is_wilted: false, needs_water: false },
            { slot_index: 2, stage: 'empty' }, { slot_index: 3, stage: 'empty' },
            { slot_index: 4, stage: 'empty' }, { slot_index: 5, stage: 'empty' },
            { slot_index: 6, stage: 'empty' }, { slot_index: 7, stage: 'empty' },
            { slot_index: 8, stage: 'empty' }, { slot_index: 9, stage: 'empty' }
        ]);
        const localInventory = loadFromLocal('inventory', [
            { id: 'inv_water', item_type: 'consumable', item_name: 'Agua Destilada', quantity: 5 },
            { id: 'inv_fert', item_type: 'consumable', item_name: 'Fertilizante Premium', quantity: 2 }
        ]);

        setProfile(localProfile);
        setTasks(localTasks);
        setGarden(localGarden);
        setInventory(localInventory);
        setLoading(false);
    };

    // Polyfill to safely generate UUIDs on mobile HTTP connections (non-secure context)
    const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback for non-HTTPS local IP testing
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    // Función de Sincronización Principal (Real-Time emulation via Promise.all)
    const fetchData = async () => {
        setLoading(true);
        try {
            // [Supabase DB Queries]: Múltiples peticiones a tablas protegidas por RLS.
            // Extrae concurrentemente el perfil, inventario, progreso del jardín 
            // y la lista de tareas activas filtradas automáticamente por el 'user.id'
            // de la sesión actual verificada.
            const [profileData, tasksData, gardenData, invData] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', session.user.id).single(),
                supabase.from('tasks').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
                supabase.from('garden').select('*').eq('user_id', session.user.id).order('slot_index', { ascending: true }),
                supabase.from('inventory').select('*').eq('user_id', session.user.id)
            ]);

            if (profileData.data) setProfile(profileData.data);
            if (tasksData.data) setTasks(tasksData.data);
            if (gardenData.data) setGarden(gardenData.data);
            if (invData.data) setInventory(invData.data);
        } catch (error) {
            console.error('Error fetching game data. Falling back to Guest Mode:', error);
            loadMockData();
        } finally {
            setLoading(false);
        }
    };

    const addTask = async (taskData) => {
        const isProject = taskData.subtasks_count >= 5;

        let monster;
        let hp = 100;

        if (isProject) {
            monster = getRandomBossMonster();
            // Assign HP based on some boss logic or generic 500
            if (monster.id === 'boss_titan') hp = 1000;
            else if (monster.id === 'boss_dragon') hp = 800;
            else hp = 500;
        } else {
            monster = getRandomDailyMonster();
            hp = 100;
        }

        const taskId = isGuest ? 'mock-' + Date.now() : generateUUID();

        const newTask = {
            id: taskId,
            title: taskData.title,
            description: taskData.description,
            subtasks_count: taskData.subtasks_count,
            user_id: session.user.id,
            is_project: isProject,
            monster_id: monster.id,
            monster_name: monster.name,
            monster_type: isProject ? 'boss' : 'daily',
            monster_color: monster.color,
            monster_sprite: monster.sprite,
            monster_style: monster.style,
            hp: hp,
            status: 'pending'
        };

        const updatedTasks = [newTask, ...tasks];
        setTasks(updatedTasks);

        if (isGuest) {
            saveToLocal('tasks', updatedTasks);
        } else {
            const dbNewTask = {
                id: taskId,
                title: taskData.title,
                description: taskData.description,
                subtasks_count: taskData.subtasks_count,
                user_id: session.user.id,
                is_project: isProject,
                monster_type: isProject ? 'boss' : 'daily',
                monster_name: monster.name,
                hp: hp,
                status: 'pending'
            };
            await supabase.from('tasks').insert(dbNewTask);
        }
    };

    const completeTask = async (taskId) => {
        // Complete task and update profile (Add XP and Coins)
        const task = tasks.find(t => t.id === taskId);
        if (!task) return null;

        const xpGained = task.is_project ? 50 : 10;
        const coinsGained = task.is_project ? 20 : 5;

        // Check hyper growth from Pomodoro
        const hyperGrowth = localStorage.getItem('questbloom_hyper_growth') === 'true';
        const growthAmount = hyperGrowth ? 2 : 1;

        // Update Garden locally
        const updatedGarden = garden.map(slot => {
            if (slot.stage === 'empty' || slot.stage === 'master' || slot.is_wilted) return slot;

            if (slot.needs_water) return slot; // Paused growth due to thirst

            const newProgress = (slot.tasks_completed_since_plant || 0) + growthAmount;
            let newStage = slot.stage;

            if (newProgress >= 10) newStage = 'master';
            else if (newProgress >= 6) newStage = 'young';
            else if (newProgress >= 3) newStage = 'sprout';

            // Random chance to become thirsty
            const needsWater = Math.random() < 0.25;

            return { ...slot, tasks_completed_since_plant: newProgress, stage: newStage, needs_water: needsWater };
        });

        setGarden(updatedGarden);

        // Update Task locally
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t);
        setTasks(updatedTasks);

        // Update Profile locally
        const newXp = profile.xp + xpGained;
        const newCoins = profile.coins + coinsGained;
        const newLevel = Math.floor(newXp / 100) + 1;
        const updatedProfile = { ...profile, xp: newXp, coins: newCoins, level: newLevel };
        setProfile(updatedProfile);

        if (isGuest) {
            saveToLocal('tasks', updatedTasks);
            saveToLocal('profile', updatedProfile);
            saveToLocal('garden', updatedGarden);
        } else {
            // [Optimistic UI]: Primero se actualizan los arreglos locales en memoria de React,
            // y luego se esperan las instrucciones a Supabase para mayor fiabilidad.
            await Promise.all([
                supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', taskId),
                supabase.from('profiles').update({ xp: newXp, coins: newCoins, level: newLevel }).eq('id', profile.id),
                ...updatedGarden.map(slot => {
                    if (slot.id) {
                        const { id, user_id, planted_at, needs_water, ...updateData } = slot;
                        return supabase.from('garden').update(updateData).eq('id', slot.id);
                    }
                    return Promise.resolve();
                })
            ]);
        }

        // Handle drops (Gacha box drop chances for seeds etc)
        // 1% boss drop logic or standard drop logic can go here later

        return { xpGained, coinsGained, task };
    };

    const updateTask = async (taskId, updates) => {
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
        setTasks(updatedTasks);
        if (isGuest) {
            saveToLocal('tasks', updatedTasks);
        } else {
            await supabase.from('tasks').update(updates).eq('id', taskId);
        }
    };

    const deleteTask = async (taskId) => {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);
        if (isGuest) {
            saveToLocal('tasks', updatedTasks);
        } else {
            await supabase.from('tasks').delete().eq('id', taskId);
        }
    };

    const updateProfile = async (updates) => {
        const updatedProfile = { ...profile, ...updates };
        setProfile(updatedProfile);

        if (isGuest) {
            saveToLocal('profile', updatedProfile);
        } else {
            await supabase.from('profiles').update(updates).eq('id', profile.id);
        }
    };

    const updateInventory = async (itemName, quantityChange, itemType = 'consumable', rarity = null) => {
        // Simple logic: if item exists, add to quantity. If not, push new.
        let exists = false;
        const updatedInv = inventory.map(item => {
            if (item.item_name === itemName) {
                exists = true;
                return { ...item, quantity: item.quantity + quantityChange };
            }
            return item;
        }).filter(item => item.quantity > 0);

        if (!exists && quantityChange > 0) {
            updatedInv.push({
                id: `inv_${Date.now()}`,
                item_name: itemName,
                quantity: quantityChange,
                item_type: itemType,
                rarity: rarity
            });
        }

        setInventory(updatedInv);

        if (isGuest) {
            saveToLocal('inventory', updatedInv);
        } else {
            try {
                if (!exists) {
                    const { error } = await supabase.from('inventory').insert({ user_id: session.user.id, item_name: itemName, quantity: quantityChange, item_type: itemType, rarity });
                    if (error) console.error("Inventory Insert Error:", error);
                } else {
                    const target = updatedInv.find(i => i.item_name === itemName);
                    if (target) {
                        const { error } = await supabase.from('inventory').update({ quantity: target.quantity }).eq('user_id', session.user.id).eq('item_name', itemName);
                        if (error) console.error("Inventory Update Error:", error);
                    } else {
                        const { error } = await supabase.from('inventory').delete().eq('user_id', session.user.id).eq('item_name', itemName);
                        if (error) console.error("Inventory Delete Error:", error);
                    }
                }
            } catch (err) {
                console.error("Inventory Exception:", err);
            }
        }
    };

    const removePlant = async (slotIndex) => {
        const updatedGarden = garden.map(g => g.slot_index === slotIndex ? {
            ...g, stage: 'empty', seed_id: null, tasks_completed_since_plant: 0, needs_water: false, is_wilted: false
        } : g);
        setGarden(updatedGarden);

        if (isGuest) {
            saveToLocal('garden', updatedGarden);
        } else {
            const slot = updatedGarden.find(g => g.slot_index === slotIndex);
            if (slot && slot.id) {
                await supabase.from('garden').update({
                    stage: 'empty', seed_id: null, tasks_completed_since_plant: 0, is_wilted: false
                }).eq('id', slot.id);
            }
        }
    };

    const syncGarden = async (updatedGarden) => {
        setGarden(updatedGarden);

        if (isGuest) {
            saveToLocal('garden', updatedGarden);
            return;
        }

        const promises = updatedGarden.map(async (slot) => {
            if (slot.id) {
                const { id, user_id, planted_at, needs_water, ...updateData } = slot;
                const { error } = await supabase.from('garden').update(updateData).eq('id', slot.id);
                if (error) console.error("Update Garden Error:", error);
                return;
            }

            // Create new slot
            if (slot.stage !== 'empty') {
                const newSlotData = {
                    user_id: profile.id,
                    slot_index: slot.slot_index,
                    stage: slot.stage,
                    seed_id: slot.seed_id,
                    tasks_completed_since_plant: slot.tasks_completed_since_plant,
                    is_wilted: slot.is_wilted
                };

                const { data, error } = await supabase.from('garden').insert(newSlotData).select().single();

                if (error) {
                    console.error("Insert Garden Error:", error);
                } else if (data) {
                    // Update local state asynchronously with the newly generated DB ID
                    setGarden(prev => prev.map(g => g.slot_index === slot.slot_index ? { ...g, id: data.id } : g));
                }
            }
        });

        await Promise.all(promises);
    };

    return (
        <GameContext.Provider value={{ profile, tasks, garden, inventory, loading, isGuest, addTask, completeTask, updateTask, deleteTask, updateProfile, updateInventory, refetch: fetchData, setGarden, saveToLocal, removePlant, syncGarden }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => useContext(GameContext);
