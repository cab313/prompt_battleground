// Main Application Entry Point - Prompt Engineering Battle Royale

import { CONFIG, getLevelByXP } from './config.js';
import { log, trackEvent, trackPageView, randomItem, estimateTokens, wait, escapeHTML } from './utils.js';
import storage from './data-storage.js';
import apiClient from './api-client.js';

console.log('='.repeat(50));
console.log('[MAIN] Starting Prompt Engineering Battle Royale...');
console.log('='.repeat(50));

// Application State
const state = {
    currentScreen: 'loading',
    profile: null,
    currentScenario: null,
    battleTimer: null,
    timerInterval: null,
    battleStartTime: null,
    currentPrompt: '',
    scenarios: [],
    achievements: [],
    avatars: [],
    battleHistory: [],
    leaderboard: [],
    tutorialStep: 0,
    activePowerUps: []
};

// Initialize Application
async function init() {
    log.info('[MAIN] Initializing application...');

    try {
        // Load data files
        await loadDataFiles();

        // Check for existing profile
        const existingProfile = storage.get(CONFIG.STORAGE.PROFILE);

        if (existingProfile) {
            log.info('[MAIN] Found existing profile:', existingProfile);
            state.profile = existingProfile;
            showScreen('lobby');
        } else {
            log.info('[MAIN] No existing profile found, showing welcome screen');
            showScreen('welcome');
        }

        // Set up event listeners
        setupEventListeners();

        // Track app load
        trackPageView('App Loaded');
        trackEvent('App', 'Initialize', 'Success');

        log.info('[MAIN] Application initialized successfully');

    } catch (error) {
        log.error('[MAIN] Error initializing application:', error);
        showNotification('Error loading application. Please refresh.', 'error');
    }
}

// Load Data Files
async function loadDataFiles() {
    log.info('[MAIN] Loading data files...');

    try {
        const [scenariosData, achievementsData, avatarsData] = await Promise.all([
            fetch('./data/scenarios.json').then(r => r.json()),
            fetch('./data/achievements.json').then(r => r.json()),
            fetch('./data/avatars.json').then(r => r.json())
        ]);

        state.scenarios = scenariosData;
        state.achievements = achievementsData;
        state.avatars = avatarsData;

        log.info('[MAIN] Data files loaded successfully');
        log.debug('[MAIN] Scenarios:', state.scenarios.length);
        log.debug('[MAIN] Achievements:', state.achievements.length);
        log.debug('[MAIN] Avatars:', state.avatars.length);

    } catch (error) {
        log.error('[MAIN] Error loading data files:', error);
        throw error;
    }
}

// Screen Management
function showScreen(screenName) {
    log.ui(`[MAIN] Showing screen: ${screenName}`);

    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        state.currentScreen = screenName;

        // Initialize screen-specific content
        switch(screenName) {
            case 'welcome':
                initWelcomeScreen();
                break;
            case 'tutorial':
                initTutorialScreen();
                break;
            case 'lobby':
                initLobbyScreen();
                break;
            case 'battle':
                initBattleScreen();
                break;
            case 'leaderboard':
                initLeaderboardScreen();
                break;
            case 'profile':
                initProfileScreen();
                break;
            case 'playground':
                initPlaygroundScreen();
                break;
        }

        trackPageView(screenName);
    }
}

// Event Listeners Setup
function setupEventListeners() {
    log.info('[MAIN] Setting up event listeners...');

    // Welcome Screen
    document.getElementById('start-tutorial-btn')?.addEventListener('click', handleStartTutorial);
    document.getElementById('skip-tutorial-btn')?.addEventListener('click', handleSkipTutorial);

    // Tutorial Screen
    document.getElementById('prev-tutorial-btn')?.addEventListener('click', handlePrevTutorial);
    document.getElementById('next-tutorial-btn')?.addEventListener('click', handleNextTutorial);

    // Lobby Screen
    document.getElementById('start-battle-btn')?.addEventListener('click', handleStartBattle);
    document.getElementById('playground-btn')?.addEventListener('click', () => showScreen('playground'));
    document.getElementById('view-profile-btn')?.addEventListener('click', () => showScreen('profile'));
    document.getElementById('view-leaderboard-btn')?.addEventListener('click', () => showScreen('leaderboard'));
    document.getElementById('export-data-btn')?.addEventListener('click', handleExportData);
    document.getElementById('sync-leaderboard-btn')?.addEventListener('click', handleSyncLeaderboard);

    // Battle Screen
    document.getElementById('return-home-battle')?.addEventListener('click', handleReturnHome);
    document.getElementById('prompt-input')?.addEventListener('input', handlePromptInput);
    document.getElementById('analyze-prompt-btn')?.addEventListener('click', handleAnalyzePrompt);
    document.getElementById('submit-prompt-btn')?.addEventListener('click', handleSubmitPrompt);
    document.getElementById('next-round-btn')?.addEventListener('click', handleNextRound);
    document.getElementById('end-battle-btn')?.addEventListener('click', () => showScreen('lobby'));
    document.getElementById('show-poor-prompt-btn')?.addEventListener('click', handleShowPoorPrompt);
    document.getElementById('use-poor-prompt-btn')?.addEventListener('click', handleUsePoorPrompt);

    // Leaderboard Screen
    document.getElementById('back-to-lobby-btn')?.addEventListener('click', () => showScreen('lobby'));

    // Profile Screen
    document.getElementById('edit-profile-btn')?.addEventListener('click', handleEditProfile);
    document.getElementById('back-to-lobby-profile-btn')?.addEventListener('click', () => showScreen('lobby'));

    // Playground Screen
    document.getElementById('return-lobby-playground')?.addEventListener('click', () => showScreen('lobby'));
    document.getElementById('playground-prompt')?.addEventListener('input', handlePlaygroundPromptInput);
    document.getElementById('pg-review-btn')?.addEventListener('click', handlePlaygroundReview);
    document.getElementById('pg-clear-btn')?.addEventListener('click', handlePlaygroundClear);
    document.getElementById('pg-save-btn')?.addEventListener('click', handlePlaygroundSave);

    // Modal
    document.getElementById('modal-close')?.addEventListener('click', hideModal);
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') hideModal();
    });

    log.info('[MAIN] Event listeners set up successfully');
}

// Welcome Screen
function initWelcomeScreen() {
    log.ui('[MAIN] Initializing welcome screen');

    // Load avatars
    const avatarGrid = document.getElementById('avatar-selection');
    if (avatarGrid) {
        avatarGrid.innerHTML = state.avatars.map(avatar =>
            `<img src="${avatar.url}" alt="${avatar.name}" class="avatar-option" data-avatar-id="${avatar.id}" title="${avatar.name}">`
        ).join('');

        // Avatar selection
        avatarGrid.querySelectorAll('.avatar-option').forEach(img => {
            img.addEventListener('click', () => {
                avatarGrid.querySelectorAll('.avatar-option').forEach(i => i.classList.remove('selected'));
                img.classList.add('selected');
            });
        });
    }
}

function handleStartTutorial() {
    log.ui('[MAIN] User clicked start tutorial');

    const username = document.getElementById('username')?.value?.trim();
    if (!username) {
        showNotification('Please enter your name', 'warning');
        return;
    }

    const selectedAvatar = document.querySelector('.avatar-option.selected');
    if (!selectedAvatar) {
        showNotification('Please select an avatar', 'warning');
        return;
    }

    createProfile(username, selectedAvatar.dataset.avatarId);
    showScreen('tutorial');
    trackEvent('User', 'Start Tutorial', username);
}

function handleSkipTutorial() {
    log.ui('[MAIN] User clicked skip tutorial');

    const username = document.getElementById('username')?.value?.trim();
    if (!username) {
        showNotification('Please enter your name', 'warning');
        return;
    }

    const selectedAvatar = document.querySelector('.avatar-option.selected');
    if (!selectedAvatar) {
        showNotification('Please select an avatar', 'warning');
        return;
    }

    createProfile(username, selectedAvatar.dataset.avatarId);
    showScreen('lobby');
    trackEvent('User', 'Skip Tutorial', username);
}

function createProfile(username, avatarId) {
    log.state('[MAIN] Creating new profile');

    const teamName = document.getElementById('team-name')?.value?.trim() || '';
    const avatar = state.avatars.find(a => a.id === avatarId);

    state.profile = {
        username,
        avatarId,
        avatarUrl: avatar.url,
        teamName,
        level: 1,
        xp: 0,
        totalBattles: 0,
        totalWins: 0,
        perfectScores: 0,
        bestScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        unlockedAchievements: [],
        powerUps: {},
        createdAt: new Date().toISOString()
    };

    storage.set(CONFIG.STORAGE.PROFILE, state.profile);
    log.info('[MAIN] Profile created:', state.profile);
}

// Tutorial Screen
function initTutorialScreen() {
    log.ui('[MAIN] Initializing tutorial screen');
    state.tutorialStep = 0;
    showTutorialStep(0);
}

function showTutorialStep(stepIndex) {
    const steps = CONFIG.TUTORIAL.STEPS;
    const container = document.getElementById('tutorial-content');
    const progress = document.getElementById('tutorial-progress');
    const prevBtn = document.getElementById('prev-tutorial-btn');
    const nextBtn = document.getElementById('next-tutorial-btn');

    if (!container) return;

    const step = steps[stepIndex];
    container.innerHTML = `
        <div class="tutorial-step active">
            <h2>${step.title}</h2>
            <p>${step.content}</p>
        </div>
    `;

    if (progress) progress.textContent = `Step ${stepIndex + 1} of ${steps.length}`;
    if (prevBtn) prevBtn.disabled = stepIndex === 0;
    if (nextBtn) {
        nextBtn.textContent = stepIndex === steps.length - 1 ? 'Enter Arena' : 'Next';
    }
}

function handlePrevTutorial() {
    if (state.tutorialStep > 0) {
        state.tutorialStep--;
        showTutorialStep(state.tutorialStep);
    }
}

function handleNextTutorial() {
    const steps = CONFIG.TUTORIAL.STEPS;
    if (state.tutorialStep < steps.length - 1) {
        state.tutorialStep++;
        showTutorialStep(state.tutorialStep);
    } else {
        showScreen('lobby');
        trackEvent('Tutorial', 'Complete', state.profile?.username);
    }
}

// Lobby Screen
function initLobbyScreen() {
    log.ui('[MAIN] Initializing lobby screen');

    if (!state.profile) return;

    // Update player info
    document.getElementById('lobby-player-name').textContent = state.profile.username;
    const levelInfo = getLevelByXP(state.profile.xp);
    document.getElementById('lobby-player-level').textContent = `Level ${levelInfo.level} - ${levelInfo.name}`;
    document.getElementById('lobby-avatar').src = state.profile.avatarUrl;

    // Update XP bar
    const xpFill = document.getElementById('lobby-xp-fill');
    const xpText = document.getElementById('lobby-xp-text');
    if (xpFill && xpText) {
        xpFill.style.width = `${levelInfo.progress * 100}%`;
        xpText.textContent = `${state.profile.xp} / ${levelInfo.xpForNextLevel} XP`;
    }

    // Update stats
    document.getElementById('total-battles').textContent = state.profile.totalBattles;
    document.getElementById('total-wins').textContent = state.profile.totalWins;
    document.getElementById('perfect-scores').textContent = state.profile.perfectScores;
    const winRate = state.profile.totalBattles > 0
        ? Math.round((state.profile.totalWins / state.profile.totalBattles) * 100)
        : 0;
    document.getElementById('win-rate').textContent = `${winRate}%`;

    // Show quick tips
    const tipsEl = document.getElementById('quick-tips');
    if (tipsEl) {
        tipsEl.innerHTML = `<p><strong>${randomItem(CONFIG.TIPS)}</strong></p>`;
    }

    // Load recent achievements
    loadRecentAchievements();
}

function loadRecentAchievements() {
    const container = document.getElementById('recent-achievements');
    if (!container) return;

    const recentAchievements = state.profile.unlockedAchievements.slice(-3);

    if (recentAchievements.length === 0) {
        container.innerHTML = '<p class="text-muted">No achievements yet. Start battling to earn them!</p>';
        return;
    }

    container.innerHTML = recentAchievements.map(achId => {
        const achievement = state.achievements.find(a => a.id === achId);
        return achievement ? `
            <div class="achievement-item">
                <span class="icon">${achievement.icon}</span>
                <div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                </div>
            </div>
        ` : '';
    }).join('');
}

// Battle Screen
function handleStartBattle() {
    log.ui('[MAIN] User started battle');
    trackEvent('Battle', 'Start', state.profile?.username);
    showScreen('battle');
}

function initBattleScreen() {
    log.ui('[MAIN] Initializing battle screen');

    // Select random scenario
    state.currentScenario = randomItem(state.scenarios);
    log.info('[MAIN] Selected scenario:', state.currentScenario.title);

    // Reset battle state
    state.currentPrompt = '';
    state.activePowerUps = [];
    state.battleStartTime = Date.now();

    // Show scenario phase
    showScenarioPhase();
}

function showScenarioPhase() {
    log.ui('[MAIN] Showing scenario phase');

    // Hide all phases
    document.querySelectorAll('.phase').forEach(phase => phase.classList.add('hidden'));
    document.getElementById('scenario-phase')?.classList.remove('hidden');

    // Update scenario content
    document.getElementById('scenario-title').textContent = state.currentScenario.title;
    document.getElementById('scenario-description').textContent = state.currentScenario.description;

    const criteriaEl = document.getElementById('scenario-criteria');
    if (criteriaEl) {
        criteriaEl.innerHTML = `
            <h4>Success Criteria:</h4>
            <ul>${state.currentScenario.criteria.map(c => `<li>${c}</li>`).join('')}</ul>
        `;
    }

    document.getElementById('scenario-data').textContent = state.currentScenario.data;

    // Start countdown
    let countdown = CONFIG.GAME.SCENARIO_COUNTDOWN;
    const countdownEl = document.getElementById('scenario-countdown');

    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdownEl) countdownEl.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            showCraftingPhase();
        }
    }, 1000);
}

function showCraftingPhase() {
    log.ui('[MAIN] Showing crafting phase');

    document.querySelectorAll('.phase').forEach(phase => phase.classList.add('hidden'));
    document.getElementById('crafting-phase')?.classList.remove('hidden');

    // Update scenario reminder
    document.getElementById('crafting-scenario-title').textContent = state.currentScenario.title;

    // Clear prompt input
    const promptInput = document.getElementById('prompt-input');
    if (promptInput) {
        promptInput.value = '';
        promptInput.focus();
    }

    // Show poor prompt section if available
    initPoorPromptSection();

    // Start timer
    startBattleTimer();

    // Update current battle info in HUD
    document.getElementById('current-round').textContent = '1';
    document.getElementById('session-score').textContent = '0';
}

function initPoorPromptSection() {
    log.ui('[MAIN] Initializing poor prompt section');

    const poorPromptSection = document.getElementById('poor-prompt-section');
    if (!poorPromptSection) return;

    // Check if scenario has a poor prompt example
    if (state.currentScenario.poorPrompt) {
        poorPromptSection.classList.remove('hidden');

        // Update poor prompt text
        document.getElementById('poor-prompt-text').textContent = state.currentScenario.poorPrompt;

        // Update issues list
        const issuesEl = document.getElementById('poor-prompt-issues');
        if (issuesEl && state.currentScenario.poorPromptIssues) {
            issuesEl.innerHTML = `
                <strong>Issues with this prompt:</strong>
                <ul style="margin: 10px 0 0 20px; padding: 0;">
                    ${state.currentScenario.poorPromptIssues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
            `;
        }

        // Hide content by default
        document.getElementById('poor-prompt-content')?.classList.add('hidden');
    } else {
        poorPromptSection.classList.add('hidden');
    }
}

function handleShowPoorPrompt() {
    log.ui('[MAIN] User clicked show poor prompt');

    const content = document.getElementById('poor-prompt-content');
    const button = document.getElementById('show-poor-prompt-btn');

    if (content && button) {
        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            button.textContent = 'Hide Poor Example';
        } else {
            content.classList.add('hidden');
            button.textContent = 'Show Poor Example';
        }
    }

    trackEvent('Battle', 'View Poor Prompt', state.profile?.username);
}

function handleUsePoorPrompt() {
    log.ui('[MAIN] User clicked use poor prompt');

    const promptInput = document.getElementById('prompt-input');
    if (promptInput && state.currentScenario.poorPrompt) {
        promptInput.value = state.currentScenario.poorPrompt;
        promptInput.focus();

        // Trigger input event to update character count
        state.currentPrompt = state.currentScenario.poorPrompt;
        document.getElementById('char-count').textContent = state.currentPrompt.length;
        document.getElementById('token-estimate').textContent = `~${estimateTokens(state.currentPrompt)}`;

        // Hide the poor prompt section after using it
        document.getElementById('poor-prompt-content')?.classList.add('hidden');
        document.getElementById('show-poor-prompt-btn').textContent = 'Show Poor Example';

        showNotification('Poor prompt loaded! Now improve it to score higher 📈', 'info');
        trackEvent('Battle', 'Use Poor Prompt', state.profile?.username);
    }
}

function startBattleTimer() {
    log.ui('[MAIN] Starting battle timer');

    state.battleTimer = CONFIG.GAME.PROMPT_TIME_LIMIT;
    const timerEl = document.getElementById('timer');

    state.timerInterval = setInterval(() => {
        state.battleTimer--;
        if (timerEl) {
            timerEl.textContent = state.battleTimer;

            if (state.battleTimer <= CONFIG.GAME.TIMER_DANGER_THRESHOLD) {
                timerEl.classList.add('danger');
            } else if (state.battleTimer <= CONFIG.GAME.TIMER_WARNING_THRESHOLD) {
                timerEl.classList.add('warning');
                timerEl.classList.remove('danger');
            }
        }

        if (state.battleTimer <= 0) {
            clearInterval(state.timerInterval);
            showNotification('Time\'s up! Submitting your prompt...', 'warning');
            handleSubmitPrompt();
        }
    }, 1000);
}

function handlePromptInput(e) {
    const input = e.target.value;
    state.currentPrompt = input;

    // Update character count
    document.getElementById('char-count').textContent = input.length;

    // Estimate tokens
    document.getElementById('token-estimate').textContent = `~${estimateTokens(input)}`;
}

async function handleAnalyzePrompt() {
    log.ui('[MAIN] User requested prompt analysis');

    if (!state.currentPrompt || state.currentPrompt.trim().length < CONFIG.GAME.MIN_PROMPT_LENGTH) {
        showNotification('Please write a prompt first (at least 10 characters)', 'warning');
        return;
    }

    const analysisPanel = document.getElementById('analysis-result');
    const analysisContent = document.getElementById('analysis-content');

    if (analysisPanel) analysisPanel.classList.remove('hidden');
    if (analysisContent) analysisContent.innerHTML = '<div class="spinner"></div> Analyzing...';

    trackEvent('Battle', 'Analyze Prompt', state.profile?.username);

    const result = await apiClient.analyzePrompt(state.currentPrompt);

    if (result.success && analysisContent) {
        analysisContent.innerHTML = `<p>${escapeHTML(result.content)}</p>`;
    } else if (analysisContent) {
        analysisContent.innerHTML = '<p class="text-danger">Analysis unavailable. Please try again.</p>';
    }
}

async function handleSubmitPrompt() {
    log.ui('[MAIN] User submitted prompt');

    if (!state.currentPrompt || state.currentPrompt.trim().length < CONFIG.GAME.MIN_PROMPT_LENGTH) {
        showNotification('Please write a prompt (at least 10 characters)', 'error');
        return;
    }

    // Stop timer
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
    }

    trackEvent('Battle', 'Submit Prompt', state.profile?.username);

    // Show evaluation phase
    showEvaluationPhase();

    // Evaluate prompt
    await evaluatePrompt();
}

function showEvaluationPhase() {
    log.ui('[MAIN] Showing evaluation phase');

    document.querySelectorAll('.phase').forEach(phase => phase.classList.add('hidden'));
    document.getElementById('evaluation-phase')?.classList.remove('hidden');
}

async function evaluatePrompt() {
    log.info('[MAIN] Evaluating user prompt');

    const statusEl = document.getElementById('evaluation-status');
    if (statusEl) statusEl.textContent = 'Analyzing prompt quality...';

    await wait(1000);

    // Get evaluation from API
    const evaluation = await apiClient.evaluatePrompt(state.currentPrompt, state.currentScenario);

    if (statusEl) statusEl.textContent = 'Generating AI response...';

    // Execute the user's prompt
    const aiResponse = await apiClient.executePrompt(state.currentPrompt, state.currentScenario.data);

    if (statusEl) statusEl.textContent = 'Calculating final score...';

    await wait(1000);

    // Show results
    showResultsPhase(evaluation, aiResponse);
}

function showResultsPhase(evaluation, aiResponse) {
    log.ui('[MAIN] Showing results phase');

    document.querySelectorAll('.phase').forEach(phase => phase.classList.add('hidden'));
    document.getElementById('results-phase')?.classList.remove('hidden');

    // Update score display
    const totalScore = Math.round(evaluation.total_score * 10) / 10;
    document.getElementById('round-score').textContent = totalScore;

    // Update breakdown
    document.getElementById('score-ai').textContent = evaluation.scores.ai_evaluation.toFixed(1);
    document.getElementById('score-format').textContent = evaluation.scores.format_quality.toFixed(1);
    document.getElementById('score-efficiency').textContent = evaluation.scores.efficiency.toFixed(1);
    document.getElementById('score-technical').textContent = evaluation.scores.technical_accuracy.toFixed(1);

    // Update progress bars
    document.getElementById('fill-ai').style.width = `${(evaluation.scores.ai_evaluation / 4) * 100}%`;
    document.getElementById('fill-format').style.width = `${(evaluation.scores.format_quality / 2) * 100}%`;
    document.getElementById('fill-efficiency').style.width = `${(evaluation.scores.efficiency / 2) * 100}%`;
    document.getElementById('fill-technical').style.width = `${(evaluation.scores.technical_accuracy / 2) * 100}%`;

    // Show AI output
    const aiOutputEl = document.getElementById('ai-output-content');
    if (aiOutputEl) {
        aiOutputEl.textContent = aiResponse.success ? aiResponse.content : 'AI response unavailable';
    }

    // Show feedback
    const feedbackEl = document.getElementById('feedback-content');
    if (feedbackEl && evaluation.feedback) {
        feedbackEl.innerHTML = `
            <h4>Strengths:</h4>
            <ul>${evaluation.feedback.strengths.map(s => `<li>${escapeHTML(s)}</li>`).join('')}</ul>
            <h4>Areas for Improvement:</h4>
            <ul>${evaluation.feedback.improvements.map(i => `<li>${escapeHTML(i)}</li>`).join('')}</ul>
            <h4>Tips:</h4>
            <ul>${evaluation.feedback.tips.map(t => `<li>${escapeHTML(t)}</li>`).join('')}</ul>
        `;
    }

    // Calculate XP and update profile
    updateProfileAfterBattle(totalScore);

    // Track event
    trackEvent('Battle', 'Complete', state.profile?.username, totalScore);
}

function updateProfileAfterBattle(score) {
    log.state('[MAIN] Updating profile after battle');

    // Calculate XP
    const baseXP = CONFIG.PROGRESSION.BASE_XP_PER_BATTLE;
    const scoreXP = Math.floor(score * CONFIG.PROGRESSION.XP_PER_SCORE_POINT);
    let bonusXP = 0;

    if (score >= CONFIG.SCORING.PERFECT_SCORE_THRESHOLD) {
        bonusXP += CONFIG.PROGRESSION.PERFECT_SCORE_BONUS;
        state.profile.perfectScores++;
    }

    if (score >= CONFIG.SCORING.WIN_SCORE_THRESHOLD) {
        bonusXP += CONFIG.PROGRESSION.WIN_BONUS;
        state.profile.totalWins++;
        state.profile.currentStreak++;
        if (state.profile.currentStreak > state.profile.longestStreak) {
            state.profile.longestStreak = state.profile.currentStreak;
        }
    } else {
        state.profile.currentStreak = 0;
    }

    const totalXP = baseXP + scoreXP + bonusXP;

    // Update profile
    state.profile.xp += totalXP;
    state.profile.totalBattles++;
    if (score > state.profile.bestScore) {
        state.profile.bestScore = score;
    }

    const levelInfo = getLevelByXP(state.profile.xp);
    state.profile.level = levelInfo.level;

    // Save battle history
    saveBattleHistory(score, totalXP);

    // Save profile
    storage.set(CONFIG.STORAGE.PROFILE, state.profile);

    // Update UI
    document.getElementById('xp-earned').textContent = `+${totalXP}`;

    log.info('[MAIN] Profile updated. XP earned:', totalXP, 'New total XP:', state.profile.xp);
}

function saveBattleHistory(score, xpEarned) {
    log.state('[MAIN] Saving battle history');

    const battleRecord = {
        id: `battle_${Date.now()}`,
        scenarioId: state.currentScenario.id,
        scenarioTitle: state.currentScenario.title,
        scenarioDescription: state.currentScenario.description,
        scenarioData: state.currentScenario.data,
        scenarioCriteria: state.currentScenario.criteria,
        prompt: state.currentPrompt,
        score: score,
        xpEarned: xpEarned,
        date: new Date().toISOString(),
        timeTaken: Math.floor((Date.now() - state.battleStartTime) / 1000)
    };

    // Get existing history
    let history = storage.get(CONFIG.STORAGE.BATTLE_HISTORY, []);

    // Add new record at the beginning
    history.unshift(battleRecord);

    // Keep only last 50 battles
    if (history.length > 50) {
        history = history.slice(0, 50);
    }

    // Save to storage
    storage.set(CONFIG.STORAGE.BATTLE_HISTORY, history);
    state.battleHistory = history;

    log.info('[MAIN] Battle history saved:', battleRecord);
}

function handleNextRound() {
    log.ui('[MAIN] User clicked next round');
    initBattleScreen();
}

function handleReturnHome() {
    log.ui('[MAIN] User clicked return home button');

    // Clear timer if active
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }

    trackEvent('Navigation', 'Return Home', state.profile?.username);
    showScreen('lobby');
    showNotification('Returned to lobby', 'info');
}

// Leaderboard Screen
function initLeaderboardScreen() {
    log.ui('[MAIN] Initializing leaderboard screen');
    updateLeaderboardDisplay();
}

// Profile Screen
function initProfileScreen() {
    log.ui('[MAIN] Initializing profile screen');

    if (!state.profile) return;

    // Update profile header
    document.getElementById('profile-name').textContent = state.profile.username;
    document.getElementById('profile-avatar').src = state.profile.avatarUrl;

    const levelInfo = getLevelByXP(state.profile.xp);
    document.getElementById('profile-level').textContent = `Level ${levelInfo.level} - ${levelInfo.name}`;

    // Update XP bar
    const xpFill = document.getElementById('profile-xp-fill');
    const xpText = document.getElementById('profile-xp-text');
    if (xpFill && xpText) {
        xpFill.style.width = `${levelInfo.progress * 100}%`;
        xpText.textContent = `${state.profile.xp} / ${levelInfo.xpForNextLevel} XP`;
    }

    // Update stats
    document.getElementById('profile-battles').textContent = state.profile.totalBattles;
    document.getElementById('profile-wins').textContent = state.profile.totalWins;
    document.getElementById('profile-perfect').textContent = state.profile.perfectScores;
    const winRate = state.profile.totalBattles > 0
        ? Math.round((state.profile.totalWins / state.profile.totalBattles) * 100)
        : 0;
    document.getElementById('profile-winrate').textContent = `${winRate}%`;

    // Load battle history
    loadBattleHistory();
}

function loadBattleHistory() {
    log.ui('[MAIN] Loading battle history');

    const historyContainer = document.getElementById('battle-history-list');
    if (!historyContainer) return;

    const history = storage.get(CONFIG.STORAGE.BATTLE_HISTORY, []);

    if (history.length === 0) {
        historyContainer.innerHTML = '<div class="empty-state"><div class="empty-state-text">No battles yet. Start playing to see your history!</div></div>';
        return;
    }

    // Show last 10 battles
    const recentHistory = history.slice(0, 10);

    historyContainer.innerHTML = recentHistory.map(battle => {
        const date = new Date(battle.date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const scoreClass = battle.score >= 7 ? 'text-success' : battle.score >= 5 ? 'text-accent' : 'text-danger';

        return `
            <div class="history-item" style="cursor: pointer;" data-battle-id="${battle.id}">
                <div class="history-details">
                    <div class="history-scenario">${battle.scenarioTitle}</div>
                    <div class="history-date">${dateStr} • ${battle.timeTaken}s</div>
                </div>
                <div style="text-align: right;">
                    <div class="history-score ${scoreClass}">${battle.score.toFixed(1)}</div>
                    <div class="history-xp">+${battle.xpEarned} XP</div>
                </div>
            </div>
        `;
    }).join('');

    // Add click handlers to view battle details
    historyContainer.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const battleId = item.dataset.battleId;
            const battle = history.find(b => b.id === battleId);
            if (battle) {
                showBattleDetails(battle);
            }
        });
    });
}

function showBattleDetails(battle) {
    log.ui('[MAIN] Showing battle details:', battle.id);

    const date = new Date(battle.date);
    const dateStr = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    showModal(`
        <h3>📝 Battle Details</h3>
        <div style="margin-bottom: 20px;">
            <h4 style="color: var(--color-primary); margin-bottom: 10px;">${battle.scenarioTitle}</h4>
            <p style="color: var(--color-text-secondary); font-size: 0.875rem;">${dateStr}</p>
        </div>

        <div style="background-color: var(--color-bg-light); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-around; text-align: center;">
                <div>
                    <div style="font-size: 2rem; font-weight: 900; color: var(--color-accent);">${battle.score.toFixed(1)}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Score</div>
                </div>
                <div>
                    <div style="font-size: 2rem; font-weight: 900; color: var(--color-primary);">+${battle.xpEarned}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-secondary);">XP Earned</div>
                </div>
                <div>
                    <div style="font-size: 2rem; font-weight: 900; color: var(--color-success);">${battle.timeTaken}s</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-secondary);">Time Taken</div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="color: var(--color-primary); margin-bottom: 10px;">📋 The Exercise:</h4>
            <div style="background-color: var(--color-bg-medium); padding: 15px; border-radius: 8px; border: 2px solid var(--color-border);">
                <p style="color: var(--color-text-secondary); margin-bottom: 10px; line-height: 1.6;">${escapeHTML(battle.scenarioDescription)}</p>
                ${battle.scenarioCriteria ? `
                    <details style="margin-top: 15px;">
                        <summary style="cursor: pointer; color: var(--color-accent); font-weight: 700; margin-bottom: 10px;">Success Criteria</summary>
                        <ul style="margin: 10px 0 0 20px; padding: 0; color: var(--color-text-secondary);">
                            ${battle.scenarioCriteria.map(c => `<li style="margin-bottom: 5px;">${escapeHTML(c)}</li>`).join('')}
                        </ul>
                    </details>
                ` : ''}
                ${battle.scenarioData ? `
                    <details style="margin-top: 15px;">
                        <summary style="cursor: pointer; color: var(--color-accent); font-weight: 700; margin-bottom: 10px;">Data Provided</summary>
                        <div style="background-color: var(--color-bg-dark); padding: 10px; border-radius: 6px; margin-top: 10px; max-height: 200px; overflow-y: auto; white-space: pre-wrap; font-family: monospace; font-size: 0.875rem; color: var(--color-text-secondary);">${escapeHTML(battle.scenarioData)}</div>
                    </details>
                ` : ''}
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="color: var(--color-accent); margin-bottom: 10px;">✏️ Your Prompt:</h4>
            <div style="background-color: var(--color-bg-dark); padding: 15px; border-radius: 8px; border: 2px solid var(--color-border); max-height: 300px; overflow-y: auto; white-space: pre-wrap; font-family: monospace; font-size: 0.875rem; line-height: 1.6; color: var(--color-text-secondary);">${escapeHTML(battle.prompt)}</div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="copy-prompt-btn" class="btn-secondary">📋 Copy Prompt</button>
            <button id="close-details-btn" class="btn-primary">Close</button>
        </div>
    `);

    // Add button handlers
    setTimeout(() => {
        document.getElementById('copy-prompt-btn')?.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(battle.prompt);
                showNotification('Prompt copied to clipboard!', 'success');
            } catch (err) {
                log.error('[MAIN] Failed to copy prompt:', err);
                showNotification('Failed to copy prompt', 'error');
            }
        });

        document.getElementById('close-details-btn')?.addEventListener('click', hideModal);
    }, 100);

    trackEvent('Battle History', 'View Details', state.profile?.username);
}

// Notification System
function showNotification(message, type = 'info') {
    log.ui(`[MAIN] Showing notification: ${message} (${type})`);

    const toast = document.getElementById('notification-toast');
    const content = toast?.querySelector('.toast-content');

    if (!toast || !content) return;

    content.textContent = message;
    toast.className = `notification-toast ${type}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, CONFIG.UI.TOAST_DURATION);
}

// Modal System
function showModal(content) {
    log.ui('[MAIN] Showing modal');

    const overlay = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');

    if (!overlay || !body) return;

    body.innerHTML = content;
    overlay.classList.remove('hidden');
}

function hideModal() {
    log.ui('[MAIN] Hiding modal');

    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Export Data Function
function handleExportData() {
    log.ui('[MAIN] User clicked export data');

    if (!state.profile) {
        showNotification('No profile data to export', 'warning');
        return;
    }

    const exportData = {
        profile: state.profile,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.profile.username}_battle_data_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('Data exported successfully!', 'success');
    trackEvent('Data', 'Export', state.profile.username);
}

// Sync Leaderboard Function
async function handleSyncLeaderboard() {
    log.ui('[MAIN] User clicked sync leaderboard');

    if (!state.profile) {
        showNotification('Create a profile first', 'warning');
        return;
    }

    try {
        // Load shared leaderboard
        const response = await fetch('./data/shared-leaderboard.json');
        const leaderboardData = await response.json();

        // Add/update current player
        const playerEntry = {
            username: state.profile.username,
            avatarUrl: state.profile.avatarUrl,
            teamName: state.profile.teamName,
            level: state.profile.level,
            xp: state.profile.xp,
            totalBattles: state.profile.totalBattles,
            totalWins: state.profile.totalWins,
            perfectScores: state.profile.perfectScores,
            bestScore: state.profile.bestScore,
            lastUpdated: new Date().toISOString()
        };

        // Update or add player
        const existingIndex = leaderboardData.players.findIndex(p => p.username === state.profile.username);
        if (existingIndex >= 1) {
            leaderboardData.players[existingIndex] = playerEntry;
        } else {
            leaderboardData.players.push(playerEntry);
        }

        // Sort by XP
        leaderboardData.players.sort((a, b) => b.xp - a.xp);

        // Save to local storage for now
        storage.set(CONFIG.STORAGE.LEADERBOARD, leaderboardData);
        state.leaderboard = leaderboardData.players;

        showNotification('Leaderboard synced! View it now.', 'success');
        trackEvent('Leaderboard', 'Sync', state.profile.username);

        // Show instructions modal
        showModal(`
            <h3>📊 Leaderboard Synced!</h3>
            <p>Your data has been added to the local leaderboard.</p>
            <h4>To share with your team:</h4>
            <ol>
                <li><strong>Export your data</strong> using the "Export My Data" button</li>
                <li><strong>Share the JSON file</strong> with your team via Slack, email, or shared drive</li>
                <li><strong>Team members can import</strong> by opening the JSON file in a text editor and manually updating the <code>shared-leaderboard.json</code> file</li>
            </ol>
            <p class="text-muted mt-lg">For automatic syncing across the team, consider deploying this app with a backend database or using a shared Google Sheet.</p>
        `);

    } catch (error) {
        log.error('[MAIN] Error syncing leaderboard:', error);
        showNotification('Error syncing leaderboard', 'error');
    }
}

// Update initLeaderboardScreen to show actual data
function updateLeaderboardDisplay() {
    log.ui('[MAIN] Updating leaderboard display');

    const leaderboardBody = document.getElementById('leaderboard-body');
    if (!leaderboardBody) return;

    const leaderboardData = storage.get(CONFIG.STORAGE.LEADERBOARD, { players: [] });
    const players = leaderboardData.players || [];

    if (players.length === 0) {
        leaderboardBody.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏆</div>
                <div class="empty-state-text">No leaderboard data yet. Sync your data to see rankings!</div>
            </div>
        `;
        return;
    }

    leaderboardBody.innerHTML = players.map((player, index) => {
        const rank = index + 1;
        const isCurrentPlayer = state.profile && player.username === state.profile.username;
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        const currentClass = isCurrentPlayer ? 'current-player' : '';

        return `
            <div class="leaderboard-row ${rankClass} ${currentClass}">
                <div class="rank-col">${rank}</div>
                <div class="player-col">
                    <img src="${player.avatarUrl}" alt="${player.username}" class="player-avatar-small">
                    <div>
                        <div class="player-name">${player.username}${isCurrentPlayer ? ' (You)' : ''}</div>
                        ${player.teamName ? `<div class="team-name">${player.teamName}</div>` : ''}
                    </div>
                </div>
                <div class="level-col">Level ${player.level}</div>
                <div class="stat-col">${player.xp}</div>
                <div class="stat-col">${player.totalWins}</div>
                <div class="stat-col">${player.perfectScores}</div>
            </div>
        `;
    }).join('');
}

// Edit Profile Function
function handleEditProfile() {
    log.ui('[MAIN] User clicked edit profile');

    if (!state.profile) {
        showNotification('No profile to edit', 'warning');
        return;
    }

    // Create avatar selection modal
    const avatarOptions = state.avatars.map(avatar =>
        `<img src="${avatar.url}"
              alt="${avatar.name}"
              class="avatar-option ${avatar.id === state.profile.avatarId ? 'selected' : ''}"
              data-avatar-id="${avatar.id}"
              title="${avatar.name}"
              style="cursor: pointer; margin: 10px; width: 80px; height: 80px; border-radius: 50%; border: 3px solid ${avatar.id === state.profile.avatarId ? '#FFD700' : '#444'};">`
    ).join('');

    showModal(`
        <h3>✏️ Edit Profile</h3>
        <div class="form-group">
            <label>Change Avatar</label>
            <div id="modal-avatar-selection" style="display: flex; flex-wrap: wrap; justify-content: center;">
                ${avatarOptions}
            </div>
        </div>
        <div class="form-group">
            <label for="modal-team-name">Team Name (Optional)</label>
            <input type="text" id="modal-team-name" value="${state.profile.teamName || ''}" maxlength="20" placeholder="Enter team name">
        </div>
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
            <button id="save-profile-btn" class="btn-primary">💾 Save Changes</button>
            <button id="cancel-edit-btn" class="btn-secondary">Cancel</button>
        </div>
    `);

    // Set up avatar selection in modal
    setTimeout(() => {
        const modalAvatars = document.querySelectorAll('#modal-avatar-selection .avatar-option');
        modalAvatars.forEach(img => {
            img.addEventListener('click', () => {
                modalAvatars.forEach(i => {
                    i.classList.remove('selected');
                    i.style.border = '3px solid #444';
                });
                img.classList.add('selected');
                img.style.border = '3px solid #FFD700';
            });
        });

        // Save button handler
        document.getElementById('save-profile-btn')?.addEventListener('click', () => {
            const selectedAvatar = document.querySelector('#modal-avatar-selection .avatar-option.selected');
            const newTeamName = document.getElementById('modal-team-name')?.value?.trim() || '';

            if (selectedAvatar) {
                const newAvatarId = selectedAvatar.dataset.avatarId;
                const newAvatar = state.avatars.find(a => a.id === newAvatarId);

                // Update profile
                state.profile.avatarId = newAvatarId;
                state.profile.avatarUrl = newAvatar.url;
                state.profile.teamName = newTeamName;

                // Save to storage
                storage.set(CONFIG.STORAGE.PROFILE, state.profile);

                // Refresh profile screen
                initProfileScreen();

                hideModal();
                showNotification('Profile updated successfully!', 'success');
                trackEvent('Profile', 'Edit', state.profile.username);
            }
        });

        // Cancel button handler
        document.getElementById('cancel-edit-btn')?.addEventListener('click', hideModal);
    }, 100);
}

// Playground Screen
function initPlaygroundScreen() {
    log.ui('[MAIN] Initializing playground screen');

    // Clear inputs
    document.getElementById('playground-prompt').value = '';
    document.getElementById('playground-context').value = '';
    document.getElementById('pg-char-count').textContent = '0';
    document.getElementById('pg-token-estimate').textContent = '~0';

    // Hide feedback section
    document.getElementById('pg-feedback-section')?.classList.add('hidden');

    // Load history
    loadPlaygroundHistory();
}

// Playground Functions
function handlePlaygroundPromptInput(e) {
    const input = e.target.value;

    // Update character count
    document.getElementById('pg-char-count').textContent = input.length;

    // Estimate tokens
    document.getElementById('pg-token-estimate').textContent = `~${estimateTokens(input)}`;
}

async function handlePlaygroundReview() {
    log.ui('[MAIN] User requested playground review');

    const promptInput = document.getElementById('playground-prompt');
    const contextInput = document.getElementById('playground-context');

    if (!promptInput || !promptInput.value.trim()) {
        showNotification('Please enter a prompt to review', 'warning');
        return;
    }

    const prompt = promptInput.value.trim();
    const context = contextInput?.value?.trim() || '';

    // Show feedback section with loading
    const feedbackSection = document.getElementById('pg-feedback-section');
    if (feedbackSection) {
        feedbackSection.classList.remove('hidden');
        document.getElementById('pg-strengths').innerHTML = '<div class="spinner"></div> Analyzing...';
        document.getElementById('pg-improvements').innerHTML = '';
        document.getElementById('pg-recommendations').innerHTML = '';
        document.getElementById('pg-quality-score').textContent = '-';
        document.getElementById('pg-quality-label').textContent = '';
    }

    trackEvent('Playground', 'Review Prompt', state.profile?.username);

    // Call API for detailed review
    const reviewMessages = [
        {
            role: 'system',
            content: `You are an expert prompt engineering coach. Provide detailed, constructive feedback on prompts.

Analyze the prompt on these dimensions:
1. Clarity and specificity
2. Structure and formatting
3. Role definition
4. Output format specification
5. Use of examples and constraints
6. Overall effectiveness

Provide your analysis in this JSON format:
{
    "strengths": ["strength1", "strength2", "strength3"],
    "improvements": ["improvement1", "improvement2", "improvement3"],
    "recommendations": ["specific recommendation1", "specific recommendation2"],
    "qualityScore": <number 0-10>,
    "qualityLabel": "<brief assessment>",
    "improvedVersion": "<optional: improved version of the prompt if significant issues found>"
}`
        },
        {
            role: 'user',
            content: context
                ? `Context: ${context}\n\nPrompt to review:\n${prompt}`
                : `Prompt to review:\n${prompt}`
        }
    ];

    const result = await apiClient.callChatCompletion(reviewMessages, { temperature: 0.3 });

    if (!result.success) {
        showNotification('Error getting feedback. Please try again.', 'error');
        document.getElementById('pg-strengths').innerHTML = '<p class="text-danger">Unable to get feedback at this time.</p>';
        return;
    }

    try {
        const review = JSON.parse(result.content);

        // Update strengths
        document.getElementById('pg-strengths').innerHTML = review.strengths && review.strengths.length > 0
            ? `<ul>${review.strengths.map(s => `<li>${escapeHTML(s)}</li>`).join('')}</ul>`
            : '<p class="text-muted">No specific strengths identified.</p>';

        // Update improvements
        document.getElementById('pg-improvements').innerHTML = review.improvements && review.improvements.length > 0
            ? `<ul>${review.improvements.map(i => `<li>${escapeHTML(i)}</li>`).join('')}</ul>`
            : '<p class="text-muted">Prompt looks good!</p>';

        // Update recommendations
        document.getElementById('pg-recommendations').innerHTML = review.recommendations && review.recommendations.length > 0
            ? `<ul>${review.recommendations.map(r => `<li>${escapeHTML(r)}</li>`).join('')}</ul>`
            : '<p class="text-muted">No additional recommendations.</p>';

        // Update quality score
        const score = review.qualityScore || 0;
        document.getElementById('pg-quality-score').textContent = score.toFixed(1);
        document.getElementById('pg-quality-label').textContent = review.qualityLabel || '';

        // Show improved version if provided
        if (review.improvedVersion && review.improvedVersion.trim()) {
            const improvedSection = document.getElementById('pg-improved-section');
            if (improvedSection) {
                document.getElementById('pg-improved-prompt').textContent = review.improvedVersion;
                improvedSection.style.display = 'block';

                // Set up copy button
                setTimeout(() => {
                    document.getElementById('pg-copy-improved-btn')?.addEventListener('click', async () => {
                        try {
                            await navigator.clipboard.writeText(review.improvedVersion);
                            showNotification('Improved prompt copied!', 'success');
                        } catch (err) {
                            log.error('[MAIN] Failed to copy improved prompt:', err);
                        }
                    });
                }, 100);
            }
        } else {
            document.getElementById('pg-improved-section').style.display = 'none';
        }

        showNotification('Analysis complete!', 'success');

    } catch (parseError) {
        log.error('[MAIN] Error parsing playground review:', parseError);
        showNotification('Error processing feedback', 'error');
        document.getElementById('pg-strengths').innerHTML = '<p class="text-danger">Error processing feedback. Please try again.</p>';
    }
}

function handlePlaygroundClear() {
    log.ui('[MAIN] User clicked playground clear');

    document.getElementById('playground-prompt').value = '';
    document.getElementById('playground-context').value = '';
    document.getElementById('pg-char-count').textContent = '0';
    document.getElementById('pg-token-estimate').textContent = '~0';
    document.getElementById('pg-feedback-section')?.classList.add('hidden');

    trackEvent('Playground', 'Clear', state.profile?.username);
}

function handlePlaygroundSave() {
    log.ui('[MAIN] User clicked playground save');

    const promptInput = document.getElementById('playground-prompt');
    const contextInput = document.getElementById('playground-context');
    const scoreEl = document.getElementById('pg-quality-score');

    if (!promptInput || !promptInput.value.trim()) {
        showNotification('No prompt to save', 'warning');
        return;
    }

    const reviewRecord = {
        id: `review_${Date.now()}`,
        prompt: promptInput.value.trim(),
        context: contextInput?.value?.trim() || '',
        score: scoreEl?.textContent !== '-' ? parseFloat(scoreEl.textContent) : null,
        date: new Date().toISOString()
    };

    // Get existing reviews
    let reviews = storage.get('promptBattle_playground_history', []);

    // Add new review at the beginning
    reviews.unshift(reviewRecord);

    // Keep only last 20 reviews
    if (reviews.length > 20) {
        reviews = reviews.slice(0, 20);
    }

    // Save to storage
    storage.set('promptBattle_playground_history', reviews);

    // Refresh history display
    loadPlaygroundHistory();

    showNotification('Review saved to history!', 'success');
    trackEvent('Playground', 'Save', state.profile?.username);
}

function loadPlaygroundHistory() {
    log.ui('[MAIN] Loading playground history');

    const historyContainer = document.getElementById('pg-history-list');
    if (!historyContainer) return;

    const reviews = storage.get('promptBattle_playground_history', []);

    if (reviews.length === 0) {
        historyContainer.innerHTML = '<div class="empty-state-text">No reviews yet</div>';
        return;
    }

    historyContainer.innerHTML = reviews.slice(0, 10).map(review => {
        const date = new Date(review.date);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const scoreText = review.score ? review.score.toFixed(1) : 'N/A';

        return `
            <div class="history-item-pg" data-review-id="${review.id}">
                <div class="history-item-score">Score: ${scoreText}</div>
                <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 4px;">
                    ${review.context ? escapeHTML(review.context.substring(0, 40)) + '...' : 'No context'}
                </div>
                <div class="history-item-date">${dateStr}</div>
            </div>
        `;
    }).join('');

    // Add click handlers
    historyContainer.querySelectorAll('.history-item-pg').forEach(item => {
        item.addEventListener('click', () => {
            const reviewId = item.dataset.reviewId;
            const review = reviews.find(r => r.id === reviewId);
            if (review) {
                document.getElementById('playground-prompt').value = review.prompt;
                document.getElementById('playground-context').value = review.context || '';
                showNotification('Prompt loaded from history', 'info');
            }
        });
    });
}

// Start the application
window.addEventListener('DOMContentLoaded', () => {
    log.info('[MAIN] DOM Content Loaded');
    init();
});

console.log('[MAIN] Main application script loaded');
