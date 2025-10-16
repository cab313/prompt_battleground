// Configuration - Application Settings and Constants

console.log('[CONFIG] Loading application configuration...');

export const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'https://api.wearables-ape.io/models/v1',
        CHAT_ENDPOINT: '/chat/completions',
        AUDIO_ENDPOINT: '/audio/transcriptions',
        API_KEY: '6d70d53c-13bd-4bc5-a084-e0532d11df98',
        MODEL: 'gpt-4o',
        MAX_TOKENS: 2000,
        TEMPERATURE: 0.7
    },

    // Game Configuration
    GAME: {
        SCENARIO_COUNTDOWN: 15,
        PROMPT_TIME_LIMIT: 120,
        TIMER_WARNING_THRESHOLD: 30,
        TIMER_DANGER_THRESHOLD: 10,
        MIN_PROMPT_LENGTH: 10,
        MAX_PROMPT_LENGTH: 2000
    },

    // Scoring Configuration
    SCORING: {
        MAX_SCORE: 10,
        WEIGHTS: {
            AI_EVALUATION: 0.4,
            FORMAT_QUALITY: 0.2,
            EFFICIENCY: 0.2,
            TECHNICAL_ACCURACY: 0.2
        },
        PERFECT_SCORE_THRESHOLD: 10,
        WIN_SCORE_THRESHOLD: 7
    },

    // XP and Leveling Configuration
    PROGRESSION: {
        BASE_XP_PER_BATTLE: 50,
        XP_PER_SCORE_POINT: 10,
        PERFECT_SCORE_BONUS: 100,
        WIN_BONUS: 50,
        LEVEL_XP_MULTIPLIER: 1.5,
        BASE_XP_FOR_NEXT_LEVEL: 100,

        LEVELS: [
            { level: 1, name: 'Prompt Apprentice', xpRequired: 0 },
            { level: 2, name: 'Prompt Practitioner', xpRequired: 100 },
            { level: 3, name: 'Prompt Specialist', xpRequired: 250 },
            { level: 4, name: 'Prompt Master', xpRequired: 500 },
            { level: 5, name: 'Prompt Engineering Expert', xpRequired: 1000 }
        ]
    },

    // Power-Ups Configuration
    POWERUPS: {
        DOUBLE_SUBMISSION: {
            id: 'double_submission',
            name: 'Double Submission',
            icon: '⚡',
            description: 'Submit two prompts and use the best score',
            cost: 100,
            uses: 1
        },
        PEER_REVIEW: {
            id: 'peer_review',
            name: 'Peer Review Shield',
            icon: '🛡️',
            description: 'Get feedback before final submission',
            cost: 50,
            uses: 1
        },
        TIME_EXTENSION: {
            id: 'time_extension',
            name: 'Time Extension',
            icon: '⏰',
            description: 'Add 60 seconds to the timer',
            cost: 75,
            uses: 1
        },
        HINT: {
            id: 'hint',
            name: 'Hint',
            icon: '💡',
            description: 'Get a hint for the current scenario',
            cost: 25,
            uses: 1
        }
    },

    // Storage Keys
    STORAGE: {
        PROFILE: 'promptBattle_profile',
        STATS: 'promptBattle_stats',
        ACHIEVEMENTS: 'promptBattle_achievements',
        BATTLE_HISTORY: 'promptBattle_history',
        LEADERBOARD: 'promptBattle_leaderboard',
        SETTINGS: 'promptBattle_settings'
    },

    // UI Configuration
    UI: {
        TOAST_DURATION: 3000,
        MODAL_TRANSITION_DURATION: 300,
        SCREEN_TRANSITION_DURATION: 500,
        ANIMATION_DELAY: 100
    },

    // Tutorial Steps
    TUTORIAL: {
        STEPS: [
            {
                title: 'Welcome to the Arena!',
                content: 'In this training battle royale, you\'ll compete to craft the best AI prompts. Each round presents a real-world scenario that tests your prompt engineering skills.',
                type: 'intro'
            },
            {
                title: 'Understanding Scenarios',
                content: 'Each scenario contains a task, criteria for success, and sample data. Read carefully and understand what the AI needs to accomplish before crafting your prompt.',
                type: 'scenario'
            },
            {
                title: 'Crafting Your Prompt',
                content: 'Write clear, specific prompts that define the role, task, format, and constraints. Use structured formatting, provide examples when helpful, and be as specific as possible.',
                type: 'prompt'
            },
            {
                title: 'Scoring System',
                content: 'Your prompts are scored on AI evaluation (40%), format quality (20%), efficiency (20%), and technical accuracy (20%). Scores range from 0-10, with 10 being perfect.',
                type: 'scoring'
            },
            {
                title: 'Level Up & Achieve',
                content: 'Earn XP for every battle, with bonuses for high scores and perfect rounds. Level up to unlock achievements, power-ups, and climb the leaderboard. May the best prompt win!',
                type: 'progression'
            }
        ]
    },

    // Quick Tips
    TIPS: [
        'Be specific and clear in your instructions.',
        'Define the role the AI should take (e.g., "You are a technical writer").',
        'Specify the output format you want (e.g., bullet points, JSON, table).',
        'Include examples when helpful to guide the AI.',
        'Use structured formatting with line breaks and sections.',
        'Define constraints (e.g., word count, tone, style).',
        'Test your prompts - think about edge cases.',
        'Use positive instructions ("Do this") rather than negative ("Don\'t do that").',
        'Break complex tasks into steps.',
        'Review the AI output carefully before submitting.'
    ],

    // Analytics
    ANALYTICS: {
        GA_ID: 'G-Q98010P7LZ',
        TRACK_EVENTS: true,
        TRACK_TIMING: true
    },

    // Debug Configuration
    DEBUG: {
        ENABLED: true,
        LOG_LEVEL: 'info',
        LOG_API_CALLS: true,
        LOG_STATE_CHANGES: true,
        LOG_UI_EVENTS: true
    }
};

// Helper function to get level info by XP
export function getLevelByXP(xp) {
    console.log(`[CONFIG] Getting level for XP: ${xp}`);
    const levels = CONFIG.PROGRESSION.LEVELS;
    for (let i = levels.length - 1; i >= 0; i--) {
        if (xp >= levels[i].xpRequired) {
            const nextLevel = levels[i + 1];
            const xpForNext = nextLevel ? nextLevel.xpRequired : levels[i].xpRequired * 2;
            return {
                ...levels[i],
                xpToNext: xpForNext - xp,
                xpForNextLevel: xpForNext,
                progress: nextLevel ? (xp - levels[i].xpRequired) / (xpForNext - levels[i].xpRequired) : 1
            };
        }
    }
    return {
        ...levels[0],
        xpToNext: levels[1].xpRequired,
        xpForNextLevel: levels[1].xpRequired,
        progress: 0
    };
}

// Helper function to calculate XP for next level
export function calculateXPForNextLevel(currentLevel) {
    console.log(`[CONFIG] Calculating XP for next level from level ${currentLevel}`);
    const levels = CONFIG.PROGRESSION.LEVELS;
    const nextLevelIndex = levels.findIndex(l => l.level === currentLevel + 1);

    if (nextLevelIndex !== -1) {
        return levels[nextLevelIndex].xpRequired;
    }

    // If beyond defined levels, use multiplier
    const lastLevel = levels[levels.length - 1];
    return Math.floor(lastLevel.xpRequired * Math.pow(CONFIG.PROGRESSION.LEVEL_XP_MULTIPLIER, currentLevel - lastLevel.level));
}

console.log('[CONFIG] Configuration loaded successfully');
console.log('[CONFIG] API Base URL:', CONFIG.API.BASE_URL);
console.log('[CONFIG] Debug Mode:', CONFIG.DEBUG.ENABLED);

export default CONFIG;
