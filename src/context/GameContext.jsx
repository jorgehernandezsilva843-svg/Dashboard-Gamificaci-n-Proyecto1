import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const GameContext = createContext();

export function GameProvider({ children, session }) {
    const [profile, setProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [garden, setGarden] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

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
        setLoading(true);
        setProfile({ id: 'guest-user', email: 'guest@questbloom.com', xp: 450, coins: 150, level: 5 });
        setTasks([
            { id: 't1', title: 'Completar prototipo UI', description: 'Terminar el rediseño de la app', is_project: true, subtasks_count: 5, monster_type: 'boss_cronos', monster_name: 'Cronos, el Devorador de Plazos', hp: 500, status: 'pending' },
            { id: 't2', title: 'Hacer ejercicio 30 min', description: 'Cardio ligero', is_project: false, subtasks_count: 0, monster_type: 'daily', monster_name: 'Slime de la Procrastinación', hp: 100, status: 'pending' }
        ]);
        setGarden([
            { slot_index: 0, seed_id: 'Margarita Común', stage: 'master', tasks_completed_since_plant: 10, is_wilted: false },
            { slot_index: 1, seed_id: 'Bonsái Galáctico', stage: 'young', tasks_completed_since_plant: 7, is_wilted: false },
            { slot_index: 2, stage: 'empty' },
            { slot_index: 3, stage: 'empty' },
            { slot_index: 4, stage: 'empty' },
            { slot_index: 5, stage: 'empty' },
            { slot_index: 6, stage: 'empty' },
            { slot_index: 7, stage: 'empty' },
            { slot_index: 8, stage: 'empty' },
            { slot_index: 9, stage: 'empty' }
        ]);
        setInventory([
            { item_type: 'consumable', item_name: 'Agua Destilada', quantity: 5 }
        ]);
        setLoading(false);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
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
        // Generate monster logic based on project size
        const isProject = taskData.subtasks_count >= 5;

        const dailyMonsters = [
            'Slime de la Procrastinación',
            'Goblin del Desorden',
            'Gárgola de la Indecisión',
            'Espectro de la Notificación',
            'Mimic de la Falsa Urgencia'
        ];

        let monsterName = '';
        let monsterType = 'daily';
        let hp = 100;

        if (isProject) {
            // Simplification: assign random boss for now if it's a project
            const bosses = [
                { name: 'Cronos, el Devorador de Plazos', type: 'boss_cronos', hp: 500 },
                { name: 'La Hidra de los Pendientes Infinitos', type: 'boss_hydra', hp: 500 },
                { name: 'El Dragón del Burnout (Agotamiento)', type: 'boss_dragon', hp: 800 },
                { name: 'El Titán del Gran Compromiso', type: 'boss_titan', hp: 1000 }
            ];
            const boss = bosses[Math.floor(Math.random() * bosses.length)];
            monsterName = boss.name;
            monsterType = boss.type;
            hp = boss.hp;
        } else {
            monsterName = dailyMonsters[Math.floor(Math.random() * dailyMonsters.length)];
            hp = 100;
        }

        const newTask = {
            id: isGuest ? 'mock-' + Date.now() : undefined,
            title: taskData.title,
            description: taskData.description,
            subtasks_count: taskData.subtasks_count,
            user_id: session.user.id,
            is_project: isProject,
            monster_name: monsterName,
            monster_type: monsterType,
            hp: hp,
            status: 'pending'
        };

        if (isGuest) {
            setTasks([newTask, ...tasks]);
            return;
        }

        const { data, error } = await supabase.from('tasks').insert(newTask).select().single();
        if (!error && data) {
            setTasks([data, ...tasks]);
        }
    };

    const completeTask = async (taskId) => {
        // Complete task and update profile (Add XP and Coins)
        const task = tasks.find(t => t.id === taskId);
        if (!task) return null;

        const xpGained = task.is_project ? 50 : 10;
        const coinsGained = task.is_project ? 20 : 5;

        // Update Task locally
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));

        // Update Profile locally
        const newXp = profile.xp + xpGained;
        const newCoins = profile.coins + coinsGained;
        const newLevel = Math.floor(newXp / 100) + 1;
        setProfile({ ...profile, xp: newXp, coins: newCoins, level: newLevel });

        if (!isGuest) {
            await supabase.from('tasks').update({ status: 'completed', completed_at: new Date() }).eq('id', taskId);
            await supabase.from('profiles').update({ xp: newXp, coins: newCoins, level: newLevel }).eq('id', profile.id);
        }

        // Handle drops (Gacha box drop chances for seeds etc)
        // 1% boss drop logic or standard drop logic can go here later

        return { xpGained, coinsGained, task };
    };

    return (
        <GameContext.Provider value={{ profile, tasks, garden, inventory, loading, addTask, completeTask, refetch: fetchData }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => useContext(GameContext);
