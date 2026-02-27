export const BESTIARY = {
    daily: [
        { id: 'd1', name: 'Slime de la Procrastinación', emoji: '💧', color: '#3b82f6', style: 'bounce' },
        { id: 'd2', name: 'Goblin del Desorden', emoji: '👺', color: '#16a34a', style: 'shake' },
        { id: 'd3', name: 'Gárgola de la Indecisión', emoji: '🗿', color: '#64748b', style: 'pulse' },
        { id: 'd4', name: 'Espectro de la Notificación', emoji: '👻', color: '#cbd5e1', style: 'float_transparent' },
        { id: 'd5', name: 'Mimic de la Falsa Urgencia', emoji: '📦', color: '#d97706', style: 'wobble' }
    ],
    bosses: [
        { id: 'boss_cronos', name: 'Cronos, el Devorador de Plazos', emoji: '⏱️', color: '#fbbf24', style: 'boss_clock' },
        { id: 'boss_hydra', name: 'La Hidra de los Pendientes', emoji: '🐉', color: '#10b981', style: 'boss_multi' },
        { id: 'boss_dragon', name: 'El Dragón del Burnout', emoji: '🔥', color: '#ef4444', style: 'boss_fire' },
        { id: 'boss_titan', name: 'El Titán del Compromiso', emoji: '🪨', color: '#475569', style: 'boss_rock' }
    ]
};

export const getRandomDailyMonster = () => {
    return BESTIARY.daily[Math.floor(Math.random() * BESTIARY.daily.length)];
};

export const getRandomBossMonster = () => {
    return BESTIARY.bosses[Math.floor(Math.random() * BESTIARY.bosses.length)];
};
