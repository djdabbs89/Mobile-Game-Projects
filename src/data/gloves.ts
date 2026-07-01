export type GloveId = 
    | 'default' | 'phantom' | 'crimson' | 'gold' 
    | 'ninja' | 'magnet' | 'hacker' | 'ghost' | 'speedster' | 'banker' 
    | 'thief_king' | 'cop_impersonator' | 'lucky_charm' | 'vampire' | 'shadow' | 'midas_ii' 
    | 'time_bender' | 'silencer'
    | 'pocket_lint' | 'street_rat' | 'syndicate_boss' | 'billionaire_thief'
    | 'badge_pincher' | 'donut_thief' | 'chief_in_disguise' | 'untouchable'
    | 'butterfingers' | 'jailbird' | 'escape_artist' | 'invisible_man'
    | 'power_seeker' | 'junkie' | 'addict' | 'ascended';

export interface GloveConfig {
    id: GloveId;
    name: string;
    description: string;
    color: string;
    border: string;
    price?: number;
    unlockCondition?: {
        type: 'total_looted' | 'cops_robbed' | 'times_caught' | 'perks_acquired';
        target: number;
        description: string;
    };
    effects: {
        speedMult?: number;
        stealthMult?: number;
        stealRateMult?: number;
        lootMult?: number;
        visionRangeMult?: number;
    };
}

export const GLOVES: Record<GloveId, GloveConfig> = {
    default: {
        id: 'default',
        name: 'Basic Glove',
        description: 'Just a regular glove. Keeps hand-prints away.',
        color: '#06b6d4',
        border: '#cffafe',
        price: 0,
        effects: {}
    },
    lucky_charm: {
        id: 'lucky_charm',
        name: 'Lucky Charm',
        description: '+10% Loot from all sources.',
        color: '#10b981',
        border: '#d1fae5',
        price: 500,
        effects: { lootMult: 1.1 }
    },
    phantom: {
        id: 'phantom',
        name: 'Phantom',
        description: '20% less awareness increase while stealing.',
        color: '#a855f7',
        border: '#e9d5ff',
        price: 1500,
        effects: { stealthMult: 0.8 }
    },
    crimson: {
        id: 'crimson',
        name: 'Crimson Rush',
        description: '10% faster movement speed.',
        color: '#f43f5e',
        border: '#ffe4e6',
        price: 2000,
        effects: { speedMult: 1.1 }
    },
    ninja: {
        id: 'ninja',
        name: 'Ninja Wrap',
        description: '20% faster steal progress, 10% less awareness.',
        color: '#334155',
        border: '#94a3b8',
        price: 3500,
        effects: { stealRateMult: 1.2, stealthMult: 0.9 }
    },
    gold: {
        id: 'gold',
        name: 'Midas Touch',
        description: '+50% Loot from all sources.',
        color: '#eab308',
        border: '#fef08a',
        price: 8000,
        effects: { lootMult: 1.5 }
    },
    banker: {
        id: 'banker',
        name: 'The Banker',
        description: '+100% Loot from Businessmen.',
        color: '#0ea5e9',
        border: '#bae6fd',
        price: 15000,
        effects: { lootMult: 2.0 } // Special conditional logic applied in steal
    },
    speedster: {
        id: 'speedster',
        name: 'Speedster',
        description: '20% movement speed increase.',
        color: '#f97316',
        border: '#ffedd5',
        price: 25000,
        effects: { speedMult: 1.2 }
    },
    hacker: {
        id: 'hacker',
        name: 'Cyber Glove',
        description: '50% faster steal progress.',
        color: '#14b8a6',
        border: '#ccfbf1',
        price: 40000,
        effects: { stealRateMult: 1.5 }
    },
    silencer: {
        id: 'silencer',
        name: 'Silencer',
        description: '50% less awareness increase while stealing.',
        color: '#475569',
        border: '#cbd5e1',
        price: 50000,
        effects: { stealthMult: 0.5 }
    },
    
    // Achievement Unlocks
    pocket_lint: {
        id: 'pocket_lint',
        name: 'Pocket Lint',
        description: '+2% Loot from all sources.',
        color: '#78716c',
        border: '#a8a29e',
        effects: { lootMult: 1.02 },
        unlockCondition: { type: 'total_looted', target: 1000, description: 'Loot a total of $1,000' }
    },
    street_rat: {
        id: 'street_rat',
        name: 'Street Rat Wraps',
        description: '5% faster movement speed.',
        color: '#8b5cf6',
        border: '#a78bfa',
        effects: { speedMult: 1.05 },
        unlockCondition: { type: 'total_looted', target: 10000, description: 'Loot a total of $10,000' }
    },
    thief_king: {
        id: 'thief_king',
        name: 'Thief King',
        description: '+20% Speed, +20% Steal Rate, +20% Loot.',
        color: '#fbbf24',
        border: '#fef3c7',
        effects: { speedMult: 1.2, stealRateMult: 1.2, lootMult: 1.2 },
        unlockCondition: {
            type: 'total_looted',
            target: 100000,
            description: 'Loot a total of $100,000'
        }
    },
    syndicate_boss: {
        id: 'syndicate_boss',
        name: 'Syndicate Boss',
        description: '+30% Loot, 10% less awareness increase.',
        color: '#dc2626',
        border: '#fca5a5',
        effects: { lootMult: 1.3, stealthMult: 0.9 },
        unlockCondition: { type: 'total_looted', target: 500000, description: 'Loot a total of $500,000' }
    },
    billionaire_thief: {
        id: 'billionaire_thief',
        name: 'Diamond Hands',
        description: '+50% Loot, 50% faster steal progress.',
        color: '#38bdf8',
        border: '#bae6fd',
        effects: { lootMult: 1.5, stealRateMult: 1.5 },
        unlockCondition: { type: 'total_looted', target: 1000000, description: 'Loot a total of $1,000,000' }
    },

    badge_pincher: {
        id: 'badge_pincher',
        name: 'Badge Pincher',
        description: 'Cops vision range reduced by 2%.',
        color: '#60a5fa',
        border: '#93c5fd',
        effects: { visionRangeMult: 0.98 },
        unlockCondition: { type: 'cops_robbed', target: 1, description: 'Rob 1 Cop' }
    },
    donut_thief: {
        id: 'donut_thief',
        name: 'Donut Thief',
        description: 'Cops vision range reduced by 5%.',
        color: '#f472b6',
        border: '#fbcfe8',
        effects: { visionRangeMult: 0.95 },
        unlockCondition: { type: 'cops_robbed', target: 10, description: 'Rob 10 Cops' }
    },
    cop_impersonator: {
        id: 'cop_impersonator',
        name: 'Blue Steel',
        description: 'Cops vision range reduced by 15%. +50% loot from Cops.',
        color: '#1d4ed8',
        border: '#bfdbfe',
        effects: { visionRangeMult: 0.85 }, // Handled conditionally
        unlockCondition: {
            type: 'cops_robbed',
            target: 50,
            description: 'Rob 50 Cops'
        }
    },
    chief_in_disguise: {
        id: 'chief_in_disguise',
        name: 'The Chief',
        description: 'Cops vision range reduced by 25%.',
        color: '#1e3a8a',
        border: '#60a5fa',
        effects: { visionRangeMult: 0.75 },
        unlockCondition: { type: 'cops_robbed', target: 100, description: 'Rob 100 Cops' }
    },
    untouchable: {
        id: 'untouchable',
        name: 'Untouchable',
        description: 'Cops vision range reduced by 50%.',
        color: '#facc15',
        border: '#fef08a',
        effects: { visionRangeMult: 0.50 },
        unlockCondition: { type: 'cops_robbed', target: 500, description: 'Rob 500 Cops' }
    },

    butterfingers: {
        id: 'butterfingers',
        name: 'Butterfingers',
        description: 'At least you tried... 1% faster movement.',
        color: '#fde047',
        border: '#fef3c7',
        effects: { speedMult: 1.01 },
        unlockCondition: { type: 'times_caught', target: 1, description: 'Get caught 1 time' }
    },
    jailbird: {
        id: 'jailbird',
        name: 'Jailbird',
        description: '+5% Steal Rate from practice.',
        color: '#d1d5db',
        border: '#f3f4f6',
        effects: { stealRateMult: 1.05 },
        unlockCondition: { type: 'times_caught', target: 10, description: 'Get caught 10 times' }
    },
    escape_artist: {
        id: 'escape_artist',
        name: 'Escape Artist',
        description: '+10% Steal Rate.',
        color: '#9ca3af',
        border: '#e5e7eb',
        effects: { stealRateMult: 1.10 },
        unlockCondition: { type: 'times_caught', target: 50, description: 'Get caught 50 times' }
    },
    ghost: {
        id: 'ghost',
        name: 'The Ghost',
        description: 'Overall vision range of all NPCs reduced by 25%.',
        color: '#f8fafc',
        border: '#cbd5e1',
        effects: { visionRangeMult: 0.75 },
        unlockCondition: {
            type: 'times_caught',
            target: 100,
            description: 'Get caught 100 times'
        }
    },
    invisible_man: {
        id: 'invisible_man',
        name: 'Invisible Man',
        description: 'All NPCs vision range reduced by 50%.',
        color: '#ffffff',
        border: '#e2e8f0',
        effects: { visionRangeMult: 0.50 },
        unlockCondition: { type: 'times_caught', target: 500, description: 'Get caught 500 times' }
    },

    power_seeker: {
        id: 'power_seeker',
        name: 'Power Seeker',
        description: '+2% Steal Rate.',
        color: '#14b8a6',
        border: '#99f6e4',
        effects: { stealRateMult: 1.02 },
        unlockCondition: { type: 'perks_acquired', target: 1, description: 'Acquire 1 Power-up Perk' }
    },
    junkie: {
        id: 'junkie',
        name: 'Adrenaline Junkie',
        description: '+5% Speed.',
        color: '#0d9488',
        border: '#5eead4',
        effects: { speedMult: 1.05 },
        unlockCondition: { type: 'perks_acquired', target: 10, description: 'Acquire 10 Power-up Perks' }
    },
    addict: {
        id: 'addict',
        name: 'Power Addict',
        description: '+10% Speed, +5% Steal Rate.',
        color: '#0f766e',
        border: '#2dd4bf',
        effects: { speedMult: 1.10, stealRateMult: 1.05 },
        unlockCondition: { type: 'perks_acquired', target: 50, description: 'Acquire 50 Power-up Perks' }
    },
    shadow: {
        id: 'shadow',
        name: 'Pure Shadow',
        description: '70% less awareness increase.',
        color: '#000000',
        border: '#333333',
        effects: { stealthMult: 0.3 },
        unlockCondition: {
            type: 'perks_acquired',
            target: 100,
            description: 'Acquire 100 Power-up Perks'
        }
    },
    ascended: {
        id: 'ascended',
        name: 'Ascended Being',
        description: '90% less awareness increase, +30% Speed.',
        color: '#a21caf',
        border: '#f5d0fe',
        effects: { stealthMult: 0.1, speedMult: 1.3 },
        unlockCondition: { type: 'perks_acquired', target: 500, description: 'Acquire 500 Power-up Perks' }
    },
    magnet: {
        id: 'magnet',
        name: 'Magneto',
        description: 'Steal progress is 25% faster. Cops awareness rises 20% slower.',
        color: '#ef4444',
        border: '#fee2e2',
        price: 12000,
        effects: { stealRateMult: 1.25 }
    },
    vampire: {
        id: 'vampire',
        name: 'Vampire Grip',
        description: 'Steal progress 10% faster, 15% more loot.',
        color: '#881337',
        border: '#fecdd3',
        price: 18000,
        effects: { stealRateMult: 1.1, lootMult: 1.15 }
    },
    midas_ii: {
        id: 'midas_ii',
        name: 'Pure Platinum',
        description: '+100% Loot from all sources.',
        color: '#e2e8f0',
        border: '#f1f5f9',
        price: 100000,
        effects: { lootMult: 2.0 }
    },
    time_bender: {
        id: 'time_bender',
        name: 'Time Bender',
        description: '+15% Speed, steal progress 30% faster.',
        color: '#8b5cf6',
        border: '#ede9fe',
        price: 65000,
        effects: { speedMult: 1.15, stealRateMult: 1.3 }
    }
};
