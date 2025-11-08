let lowAnimationMode = false;
let inactivityTimer;

// モードごとの最高記録を管理するオブジェクト（ここで簡単に編集可能）
const SOKOHARA_RECORDS = {
    TRAINING: "最高記録: 底原永和 LV.32, 372,700点",
    SPRINT: "最高記録: 底原永和 01分15秒",
    ULTRA: "最高記録: 底原永和 450,100点",
    VS_CPU: "最高記録: 底原永和 VS CPU LV.9 勝利",
    ULTRA_VS_CPU: "最高記録: 底原永和 VS CPU LV.9, 520,300点"
};

// 1時間操作がなかったらホームに戻る機能
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    const oneHour = 60 * 60 * 1000;
    inactivityTimer = setTimeout(() => {
        alert('1時間操作がなかったため、ホームに戻ります。');
        window.location.href = '../../index.html'; // パスを修正
    }, oneHour);
}

// ユーザー操作を検知してタイマーをリセット
function setupInactivityListener() {
    resetInactivityTimer();
    window.addEventListener('mousemove', resetInactivityTimer, { passive: true });
    window.addEventListener('keydown', resetInactivityTimer, { passive: true });
    window.addEventListener('touchstart', resetInactivityTimer, { passive: true });
}

window.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const skipBtn = document.getElementById('skipBtn');
    const animationScreen = document.getElementById('animation-mode-screen');
    const initialSetupContainer = document.getElementById('initial-setup-container');

    const showAnimationChoice = () => {
        if (loader.parentNode) {
            loader.classList.add('fade-out');
            loader.addEventListener('animationend', () => {
                if (loader.parentNode) loader.remove();
            }, { once: true });
            
            initialSetupContainer.classList.remove('hidden');
            animationScreen.classList.remove('hidden');
            animationScreen.classList.add('fade-in');

            document.querySelectorAll('[data-animation-mode]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    lowAnimationMode = e.target.dataset.animationMode === 'low';
                    initialSetupContainer.classList.add('hidden');
                    showUpdateInfo();
                }, { once: true });
            });
        }
    };

    const skipLoading = () => {
        clearTimeout(startTimer);
        showAnimationChoice();
    };

    let startTimer = setTimeout(showAnimationChoice, 14000);
    skipBtn.addEventListener('click', skipLoading);
    
    // 無操作タイマーを開始
    setupInactivityListener();
});

function showUpdateInfo() {
    const noticeModal = document.getElementById('noticeModal');
    if (noticeModal) {
        noticeModal.classList.remove('hidden');
        document.getElementById('closeNoticeBtn').addEventListener('click', () => {
            noticeModal.classList.add('hidden');
            startMainApp();
        }, { once: true });
    } else {
         startMainApp();
    }
}

function startMainApp() {
    const appContainer = document.getElementById('appContainer');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    appContainer.classList.remove('hidden');
    appContainer.classList.add('fade-in');
    hamburgerIcon.classList.remove('hidden');
    initGame();
}

const devHUD = {
    enabled: false,
    elements: { hud: document.getElementById('dev-hud'), console: document.getElementById('dev-console'), },
    perf: { lastTime: performance.now(), frames: 0, fps: 0, frameTime: 0, cpuUsage: 0, memory: 'N/A', drawCalls: 0 },
    progress: { round: 'N/A', level: 1, lines: 0, score: 0, playTime: 0, startTime: performance.now(), isOver: false, mode: 'N/A' },
    graphics: { spriteCount: 0, canvasSize: '0x0', devicePixelRatio: window.devicePixelRatio || 1 },
    input: { lastKey: 'N/A', history: [], mouse: { x: 0, y: 0 }, clicks: 0 },
    data: { objectCount: 0, currentPiece: 'None', nextPiece: 'None', heldPiece: 'None' },
    system: { userAgent: navigator.userAgent.substring(0, 40) + '...', windowSize: `${window.innerWidth}x${window.innerHeight}`, refreshRate: 'N/A' },
    debug: { flags: { devMode: false, lowAnim: false } }
};

function updateDevHUD() {
    if (!devHUD.enabled) { requestAnimationFrame(updateDevHUD); return; }
    const now = performance.now();
    const delta = now - devHUD.perf.lastTime;
    devHUD.perf.frameTime = delta;
    devHUD.perf.lastTime = now;
    devHUD.perf.frames++;
    if (now > (devHUD.perf.lastCalcTime || 0) + 1000) {
        devHUD.perf.fps = devHUD.perf.frames;
        devHUD.perf.frames = 0;
        devHUD.perf.lastCalcTime = now;
        devHUD.system.refreshRate = `${devHUD.perf.fps} Hz (est.)`;
    }
    const targetFrameTime = 1000 / 60;
    devHUD.perf.cpuUsage = Math.min(100, (devHUD.perf.frameTime / targetFrameTime) * 100);
    devHUD.perf.memory = performance.memory ? `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB` : 'N/A';
    devHUD.progress.playTime = (now - devHUD.progress.startTime) / 1000;
    const fpsClass = devHUD.perf.fps >= 55 ? 'fps-good' : devHUD.perf.fps >= 30 ? 'fps-warn' : 'fps-bad';
    devHUD.elements.hud.innerHTML = `<div>--[ 📊 PERFORMANCE ]---------<br>FPS : <span class="${fpsClass}">${devHUD.perf.fps}</span><br>Frame Time : ${devHUD.perf.frameTime.toFixed(2)} ms<br>CPU Usage : ${devHUD.perf.cpuUsage.toFixed(1)} %<br>Memory : ${devHUD.perf.memory}<br>Draw Calls : ${devHUD.perf.drawCalls}<br><br>--[ 🚀 PROGRESS ]------------<br>Mode : ${devHUD.progress.mode}<br>Score : ${devHUD.progress.score}<br>Level : ${devHUD.progress.level}<br>Lines : ${devHUD.progress.lines}<br>Time : ${devHUD.progress.playTime.toFixed(1)} s<br>Finished : ${devHUD.progress.isOver}<br><br>--[ 🧩 PIECE DATA ]----------<br>Current : ${devHUD.data.currentPiece}<br>Next : ${devHUD.data.nextPiece}<br>Hold : ${devHUD.data.heldPiece}</div><div>--[ 🖥 GRAPHICS ]------------<br>Sprites : ${devHUD.graphics.spriteCount}<br>Canvas : ${devHUD.graphics.canvasSize}<br>DPR : ${devHUD.graphics.devicePixelRatio.toFixed(2)}<br><br>--[ 🔍 INPUT ]----------------<br>Last Key : ${devHUD.input.lastKey}<br>History : [${devHUD.input.history.join(', ')}]<br>Mouse/Touch: ${devHUD.input.mouse.x}, ${devHUD.input.mouse.y}<br>Clicks : ${devHUD.input.clicks}<br><br>--[ ⚙️ SYSTEM ]--------------<br>User Agent : ${devHUD.system.userAgent}<br>Window Size: ${devHUD.system.windowSize}<br><br>--[ 🐞 DEBUG ]----------------<br>Low Anim : ${devHUD.debug.flags.lowAnim ? 'ON' : 'OFF'}<br><div class="dev-controls-panel"><button data-action="set-score">Set Score</button></div></div>`;
    devHUD.perf.drawCalls = 0;
    requestAnimationFrame(updateDevHUD);
}
function logToDevConsole(message, type = 'log') { if (!devHUD.enabled) return; const p = document.createElement('p'); p.className = `log-${type}`; p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`; devHUD.elements.console.appendChild(p); devHUD.elements.console.scrollTop = devHUD.elements.console.scrollHeight; }
window.addEventListener('keydown', e => { devHUD.input.lastKey = e.key; devHUD.input.history.unshift(e.key); if (devHUD.input.history.length > 5) devHUD.input.history.pop(); });
requestAnimationFrame(updateDevHUD);

function initGame() {
    const COLS = 10, ROWS = 20;
    const TETROMINOS = {
        'I': { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: '#4D96FF', name: 'I' },
        'O': { shape: [[1, 1], [1, 1]], color: '#FFD166', name: 'O' },
        'T': { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#9B5DE5', name: 'T' },
        'S': { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#06D6A0', name: 'S' },
        'Z': { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#FF6B6B', name: 'Z' },
        'J': { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: '#FF7AB6', name: 'J' },
        'L': { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: '#f08a5d', name: 'L' }
    };
    const POINTS = { 1: 100, 2: 300, 3: 500, 4: 800 };
    const COMMON_KICKS = {
        '0-1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        '1-0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
        '1-2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
        '2-1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        '2-3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
        '3-2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
        '3-0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
        '0-3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    };
    const I_KICKS = {
        '0-1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
        '1-0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
        '1-2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
        '2-1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
        '2-3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
        '3-2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
        '3-0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
        '0-3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    };
    const WALL_KICK_DATA = { 'I': I_KICKS, 'J': COMMON_KICKS, 'L': COMMON_KICKS, 'S': COMMON_KICKS, 'Z': COMMON_KICKS, 'T': COMMON_KICKS };

    const ATTACK_LINES = { 1: 1, 2: 2, 3: 3, 4: 5 };
    const COMBO_ATTACK = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6];
    const CPU_LEVELS = { 1: { thinkTime: 700, actionInterval: 150, mistakeChance: 0.5, weights: { AGG_H: -0.4, COMP_L: 0.6, HOLES: -0.3, BUMP: -0.1, WELLS: -0.2 } }, 2: { thinkTime: 600, actionInterval: 130, mistakeChance: 0.4, weights: { AGG_H: -0.45, COMP_L: 0.7, HOLES: -0.4, BUMP: -0.15, WELLS: -0.25 } }, 3: { thinkTime: 500, actionInterval: 110, mistakeChance: 0.3, weights: { AGG_H: -0.5, COMP_L: 0.8, HOLES: -0.5, BUMP: -0.2, WELLS: -0.3 } }, 4: { thinkTime: 400, actionInterval: 100, mistakeChance: 0.2, weights: { AGG_H: -0.5, COMP_L: 0.9, HOLES: -0.6, BUMP: -0.2, WELLS: -0.3 } }, 5: { thinkTime: 300, actionInterval: 90, mistakeChance: 0.1, weights: { AGG_H: -0.55, COMP_L: 1.0, HOLES: -0.7, BUMP: -0.25, WELLS: -0.35 } }, 6: { thinkTime: 200, actionInterval: 80, mistakeChance: 0.05, weights: { AGG_H: -0.55, COMP_L: 1.1, HOLES: -0.8, BUMP: -0.25, WELLS: -0.35 } }, 7: { thinkTime: 150, actionInterval: 70, mistakeChance: 0.02, weights: { AGG_H: -0.6, COMP_L: 1.2, HOLES: -0.9, BUMP: -0.3, WELLS: -0.4 } }, 8: { thinkTime: 100, actionInterval: 60, mistakeChance: 0.01, weights: { AGG_H: -0.6, COMP_L: 1.2, HOLES: -0.9, BUMP: -0.3, WELLS: -0.4 } }, 9: { thinkTime: 50, actionInterval: 50, mistakeChance: 0, weights: { AGG_H: -0.6, COMP_L: 1.2, HOLES: -0.9, BUMP: -0.3, WELLS: -0.4 } } };
    
    const appContainer = document.getElementById('appContainer'), playerGameContainer = document.getElementById('player-game-container'), boardEl = document.getElementById('board'), highScoreEl = document.getElementById('highScore'), currentScoreEl = document.getElementById('currentScore'), forceRestartBtn = document.getElementById('forceRestartBtn'), linesEl = document.getElementById('lines'), levelEl = document.getElementById('level'), holdContainer = document.getElementById('holdContainer'), gameOverlay = document.getElementById('game-overlay'), startScreen = document.getElementById('start-screen'), gameoverScreen = document.getElementById('gameover-screen'), gameoverTitle = document.getElementById('gameover-title'), gameoverResult = document.getElementById('gameover-result'), restartButton = document.getElementById('restartButton'), pauseScreen = document.getElementById('pause-screen'), resumeButton = document.getElementById('resumeButton'), pauseButton = document.getElementById('pauseButton'), modeInfoPanel = document.getElementById('modeInfoPanel'), modeInfoTitle = document.getElementById('modeInfoTitle'), modeInfoContent = document.getElementById('modeInfoContent'), countdownEl = document.getElementById('countdown');
    const cpuContainer = document.getElementById('cpu-container'), cpuBoardEl = document.getElementById('cpu-board'), cpuLevelBox = document.getElementById('cpu-level-box');
    const vsCpuBtn = document.getElementById('vs-cpu-btn'), vsCpuSelect = document.getElementById('vs-cpu-select');
    const ultraVsCpuBtn = document.getElementById('ultra-vs-cpu-btn'), ultraVsCpuSelect = document.getElementById('ultra-vs-cpu-select');
    const hamburgerIcon = document.getElementById('hamburger-icon'), menuPanel = document.getElementById('menu-panel'), menuRestartBtn = document.getElementById('menu-restart-btn'), soundToggle = document.getElementById('sound-toggle'), menuCheatBtn = document.getElementById('menu-cheat-btn');
    const spNextPanel = document.getElementById('sp-next-panel'), nextContainer = document.getElementById('nextContainer');
    const playerNextPanelVS = document.querySelector('.side-panel.player-next-panel'), playerNextContainerVS = document.getElementById('playerNextContainerVS');
    const cpuInfoPanel = document.querySelector('.side-panel.cpu-info-panel'), cpuNextContainer = document.getElementById('cpuNextContainer'), cpuHoldContainer = document.getElementById('cpuHoldContainer');
    const pauseRestartButton = document.getElementById('pauseRestartButton');
    const menuHomeBtn = document.getElementById('menu-home-btn');
    const pauseHomeButton = document.getElementById('pauseHomeButton');

    let player = {};
    let cpu = null;
    
    let isPaused, isOver, gameMode, cpuLevel, bestScores = {}, keys = {};
    let lastTime = 0, animationFrameId, countdownInterval, cpuActionInterval, gameTimer, gameInterval;
    let dasTimer, arrTimer, softDropTimer, keyMap, actionToChange = null;

    const defaultKeyMap = { moveLeft: 'ArrowLeft', moveRight: 'ArrowRight', softDrop: 'ArrowDown', hardDrop: 'ArrowUp', rotateLeft: 'z', rotateRight: 'x', hold: 'c' };
    const actionLabels = { moveLeft: '左移動', moveRight: '右移動', softDrop: 'ソフトドロップ', hardDrop: 'ハードドロップ', rotateLeft: '左回転', rotateRight: '右回転', hold: 'ホールド' };
    const LOCK_DELAY = 500, LANDING_RESET_LIMIT = 15, DAS_DELAY = 160, ARR_DELAY = 30, SOFT_DROP_DELAY = 50;

    const createPlayerState = (isCPU = false) => ({
        board: Array(ROWS).fill(0).map(() => Array(COLS).fill(null)),
        currentPiece: null,
        nextPiece: null,
        heldPiece: null,
        pieceBag: [],
        canHold: true,
        score: 0,
        lines: 0,
        level: 1,
        combo: 0,
        isOver: false,
        isLanded: false,
        landingResets: 0,
        lockDelayTimer: null,
        isCPU,
        pendingGarbage: 0,
        dropInterval: 1000,
        dropCounter: 0,
        clearingRows: [],
        ai: { actionQueue: [], isThinking: false }
    });


    function init() {
        bestScores = loadBestScores();
        loadKeyMap();
        isPaused = true;
        isOver = true;
        setupUI();
        createEmptyBoard(boardEl);
        if(cpuBoardEl) createEmptyBoard(cpuBoardEl);

        document.querySelectorAll('#start-screen .btn[data-mode]').forEach(btn => btn.addEventListener('click', (e) => startGame(e.target.dataset.mode)));
        vsCpuBtn.addEventListener('click', () => { ultraVsCpuSelect.classList.remove('open'); vsCpuSelect.classList.toggle('open'); });
        ultraVsCpuBtn.addEventListener('click', () => { vsCpuSelect.classList.remove('open'); ultraVsCpuSelect.classList.toggle('open'); });

        restartButton.addEventListener('click', showStartScreen);
        pauseButton.addEventListener('click', togglePause);
        resumeButton.addEventListener('click', togglePause);
        forceRestartBtn.addEventListener('click', () => { if (!isOver && confirm('本当に現在のゲームを終了し、モード選択に戻りますか？')) { showStartScreen(); } else if (isOver) { showStartScreen(); } });
        menuRestartBtn.addEventListener('click', () => { if (isOver || isPaused || confirm('本当に現在のゲームを終了し、モード選択に戻りますか？')) { showStartScreen(); } menuPanel.classList.remove('open'); });
        pauseRestartButton.addEventListener('click', () => { if (confirm('本当に現在のゲームを終了し、モード選択に戻りますか？')) { showStartScreen(); } });
        
        const goHome = () => {
            if (confirm('ホームに戻りますか？現在のゲームの進行状況は失われます。')) {
                window.location.href = '../../index.html'; // パスを修正
            }
        };
        menuHomeBtn.addEventListener('click', goHome);
        pauseHomeButton.addEventListener('click', goHome);

        setupKeyHandlers();
        setupExtraFeatures();
        setupKeyConfigModal();
        setupDevMode();
    }

    function showModeRecord(mode) {
        const recordEl = document.getElementById('sokohara-record');
        if (!recordEl) return;
    
        let modeKey;
        if (mode.startsWith('VS_CPU')) {
            modeKey = 'VS_CPU';
        } else if (mode.startsWith('ULTRA_VS_CPU')) {
            modeKey = 'ULTRA_VS_CPU';
        } else {
            modeKey = mode;
        }
    
        if (SOKOHARA_RECORDS[modeKey]) {
            recordEl.textContent = SOKOHARA_RECORDS[modeKey];
            recordEl.classList.remove('hidden');
    
            recordEl.style.animation = 'none';
            void recordEl.offsetWidth;
            recordEl.style.animation = 'fade-in-then-out 5s ease-out forwards';
    
            recordEl.addEventListener('animationend', () => {
                recordEl.classList.add('hidden');
            }, { once: true });
        } else {
            recordEl.classList.add('hidden');
        }
    }

    function startGame(mode) {
        showModeRecord(mode);

        gameMode = mode;
        cpuLevel = 0;
        if (gameMode.startsWith('VS_CPU') || gameMode.startsWith('ULTRA_VS_CPU')) {
            cpuLevel = parseInt(mode.split('_').pop(), 10);
            gameMode = gameMode.startsWith('ULTRA_VS_CPU') ? 'ULTRA_VS_CPU' : 'VS_CPU';
            cpuLevelBox.textContent = `LV.${cpuLevel}`;
        }

        if (gameMode === 'VS_CPU' || gameMode === 'ULTRA_VS_CPU') {
            appContainer.className = 'app vs-cpu-mode';
            cpuContainer.classList.remove('hidden');
            playerNextPanelVS.classList.remove('hidden');
            cpuInfoPanel.classList.remove('hidden');
            spNextPanel.classList.add('hidden');
            document.querySelector('.side-panel.right').style.display = 'none';
        } else {
            appContainer.className = 'app single-player-mode';
            cpuContainer.classList.add('hidden');
            playerNextPanelVS.classList.add('hidden');
            cpuInfoPanel.classList.add('hidden');
            spNextPanel.classList.remove('hidden');
            document.querySelector('.side-panel.right').style.display = '';
        }

        startScreen.classList.add('hidden');
        gameoverScreen.classList.add('hidden');
        pauseScreen.classList.add('hidden');
        appContainer.classList.remove('game-inactive-blur');

        let count = 3;
        countdownEl.textContent = count;
        countdownEl.classList.remove('hidden');
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            count--;
            if (count > 0) { countdownEl.textContent = count; } 
            else { clearInterval(countdownInterval); countdownEl.classList.add('hidden'); startActualGame(); }
        }, 1000);
    }

    function startActualGame() {
        gameOverlay.classList.add('hidden');
        isPaused = false;
        isOver = false;
        pauseButton.textContent = "停止";

        player = createPlayerState();
        fillPieceBag(player);
        player.nextPiece = getNextPieceFromBag(player);
        spawnPiece(player);

        cpu = (gameMode === 'VS_CPU' || gameMode === 'ULTRA_VS_CPU') ? createPlayerState(true) : null;
        if (cpu) {
            fillPieceBag(cpu);
            cpu.nextPiece = getNextPieceFromBag(cpu);
            spawnPiece(cpu);
        }
        
        if (gameInterval) clearInterval(gameInterval);
        if (cpuActionInterval) clearInterval(cpuActionInterval);

        if (gameMode === 'SPRINT') gameTimer = 0;
        else if (gameMode === 'ULTRA' || gameMode === 'ULTRA_VS_CPU') gameTimer = 180;
        
        gameInterval = setInterval(() => {
            if (isPaused || isOver) return;
            if (gameMode === 'SPRINT') gameTimer++;
            else if (gameMode === 'ULTRA' || gameMode === 'ULTRA_VS_CPU') {
                gameTimer--;
                if (gameTimer <= 0) { 
                    gameTimer = 0;
                    gameOver(gameMode === 'ULTRA_VS_CPU' ? (player.score > cpu.score ? cpu : player) : player);
                }
            }
            updateUI();
        }, 1000);

        if(cpu) {
            cpuActionInterval = setInterval(cpuGameLoop, CPU_LEVELS[cpuLevel].actionInterval);
        }

        updateUI();
        lastTime = 0;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if(devHUD.enabled) devHUD.progress.startTime = performance.now();
        gameLoop();
    }

    function gameLoop(time = 0) {
        if (isOver) return;
        animationFrameId = requestAnimationFrame(gameLoop);
        if (isPaused) { lastTime = time; return; }

        const deltaTime = time - lastTime;
        lastTime = time;

        if (!player.isOver) {
            player.dropCounter += deltaTime;
            if (player.dropCounter > player.dropInterval) {
                drop(player);
            }
        }

        if (cpu && !cpu.isOver) {
            cpu.dropCounter += deltaTime;
            if (cpu.dropCounter > cpu.dropInterval) {
                drop(cpu);
            }
        }

        draw(player, boardEl);
        if (cpu) draw(cpu, cpuBoardEl);
    }
    
    function cpuGameLoop() {
        if (isOver || !cpu || cpu.isOver || isPaused) return;
        if (cpu.ai.actionQueue.length > 0) {
            executeCpuAction();
        } else if (!cpu.ai.isThinking) {
            runCpuTurn(cpu);
        }
    }

    function togglePause() {
        if (isOver) return;
        isPaused = !isPaused;
        if (isPaused) {
            gameOverlay.classList.remove('hidden');
            pauseScreen.classList.remove('hidden');
            pauseButton.textContent = "再開";
            appContainer.classList.add('game-inactive-blur');
            clearAllInputTimers();
        } else {
            gameOverlay.classList.add('hidden');
            pauseScreen.classList.add('hidden');
            pauseButton.textContent = "停止";
            lastTime = performance.now();
            appContainer.classList.remove('game-inactive-blur');
        }
    }

    function fillPieceBag(target) {
        const p = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
        target.pieceBag.push(...p);
    }

    function getNextPieceFromBag(target) {
        if (target.pieceBag.length < 7) fillPieceBag(target);
        const name = target.pieceBag.shift();
        const piece = TETROMINOS[name];
        return { ...piece, shape: JSON.parse(JSON.stringify(piece.shape)), x: Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2) + (name === 'O' ? 1 : 0), y: name === 'I' ? -1 : 0, rotation: 0 };
    }
    
    function spawnPiece(target) {
        if(isOver || target.isOver) return;
        target.currentPiece = target.nextPiece;
        target.nextPiece = getNextPieceFromBag(target);
        resetLandingStatus(target);
        if (!isValidMove(target.currentPiece, target.board)) {
            gameOver(target);
            return;
        }
        if (target.isCPU && !target.ai.isThinking) {
            runCpuTurn(target);
        }
    }
    
    function move(target, dir) {
        if (!target.currentPiece || target.isOver) return;
        const piece = { ...target.currentPiece, x: target.currentPiece.x + dir };
        if (isValidMove(piece, target.board)) {
            target.currentPiece.x += dir;
            if(!target.isCPU) resetLandingTimerOnMove(target);
        }
    }

    function drop(target) {
        if (!target.currentPiece || target.isOver) return;
        const piece = { ...target.currentPiece, y: target.currentPiece.y + 1 };
        if (isValidMove(piece, target.board)) {
            target.currentPiece.y++;
            if(!target.isCPU) clearLockDelayTimer(target);
            target.isLanded = false;
        } else {
            if (!target.isLanded) {
                target.isLanded = true;
                startLockDelayTimer(target);
            }
        }
        target.dropCounter = 0;
    }

    function hardDrop(target) {
        if (!target.currentPiece || target.isOver) return;
        let y = target.currentPiece.y;
        while (isValidMove({ ...target.currentPiece, y: y + 1 }, target.board)) {
            y++;
        }
        if (y > target.currentPiece.y) {
           target.currentPiece.y = y;
           playHardDropAnimation(target);
        }
        lockPiece(target);
    }

    function rotate(target, dir) {
        if (!target.currentPiece || target.currentPiece.name === 'O' || target.isOver) return;

        const p = target.currentPiece;
        let newShape = JSON.parse(JSON.stringify(p.shape));

        if (dir === 1) { // Clockwise
            newShape = newShape[0].map((_, colIndex) => newShape.map(row => row[colIndex]).reverse());
        } else { // Counter-clockwise
            newShape = newShape.map(row => row.reverse());
            newShape = newShape[0].map((_, colIndex) => newShape.map(row => row[colIndex]));
        }

        const newRotation = (p.rotation + dir + 4) % 4;
        const kickTableId = dir === 1 ? `${p.rotation}-${newRotation}` : `${(newRotation - 1 + 4)%4}-${(p.rotation - 1 + 4)%4}`;
        const effectiveKickId = `${p.rotation}-${newRotation}`;

        const kickTable = WALL_KICK_DATA[p.name][effectiveKickId];
        if (!kickTable) return;

        for (const kick of kickTable) {
            const dx = kick[0];
            const dy = kick[1];
            
            const newPiece = { ...p, shape: newShape, x: p.x + dx, y: p.y - dy };

            if (isValidMove(newPiece, target.board)) {
                p.x += dx;
                p.y -= dy;
                p.shape = newShape;
                p.rotation = newRotation;
                if (!target.isCPU) resetLandingTimerOnMove(target);
                return;
            }
        }
    }

    function hold(target) {
        if (!target.canHold || target.isOver) return;
        target.canHold = false;
        clearLockDelayTimer(target);
        if (target.heldPiece) {
            [target.currentPiece, target.heldPiece] = [target.heldPiece, target.currentPiece];
            target.currentPiece.x = Math.floor(COLS / 2) - Math.floor(target.currentPiece.shape[0].length / 2) + (target.currentPiece.name === 'O' ? 1 : 0);
            target.currentPiece.y = target.currentPiece.name === 'I' ? -1 : 0;
            target.currentPiece.rotation = 0;
            target.currentPiece.shape = JSON.parse(JSON.stringify(TETROMINOS[target.currentPiece.name].shape));
            resetLandingStatus(target);
        } else {
            target.heldPiece = target.currentPiece;
            spawnPiece(target);
        }
        if (!isValidMove(target.currentPiece, target.board)) {
            gameOver(target);
        }
        if (target.isCPU) runCpuTurn(target);
        updateUI();
    }

    function startLockDelayTimer(target) { clearLockDelayTimer(target); target.lockDelayTimer = setTimeout(() => lockPiece(target), LOCK_DELAY); }
    function clearLockDelayTimer(target) { if(target.lockDelayTimer) clearTimeout(target.lockDelayTimer); target.lockDelayTimer = null; }
    function resetLandingStatus(target) { target.isLanded = false; target.landingResets = 0; clearLockDelayTimer(target); }
    function resetLandingTimerOnMove(target) { if (target.isLanded && target.landingResets < LANDING_RESET_LIMIT) { startLockDelayTimer(target); target.landingResets++; } }

    async function lockPiece(target) {
        if (!target.currentPiece || target.isOver) return;
        
        if(!target.isCPU) clearAllInputTimers();
        
        const piece = target.currentPiece;
        clearLockDelayTimer(target);
        
        if (!isValidMove(piece, target.board)) {
            piece.y--;
            if (!isValidMove(piece, target.board)) { gameOver(target); return; }
        }
        
        const element = target.isCPU ? cpuBoardEl : boardEl;
        if (!lowAnimationMode) {
          piece.shape.forEach((row, dy) => row.forEach((val, dx) => {
            if (val) {
              const bY = piece.y + dy, bX = piece.x + dx;
              if (bY >= 0 && element.children[bY * COLS + bX]) {
                const flash = document.createElement('div');
                flash.className = 'lock-flash-effect';
                element.children[bY * COLS + bX].appendChild(flash);
                setTimeout(() => flash.remove(), 200);
              }
            }
          }));
        }

        piece.shape.forEach((row, dy) => row.forEach((val, dx) => {
            if (val) {
                const bX = piece.x + dx, bY = piece.y + dy;
                if (bY >= 0) target.board[bY][bX] = piece.color;
            }
        }));

        target.currentPiece = null;
        if(!target.isCPU) playSound('pushAudio');

        const clearedLineCount = await clearLines(target);
        let sentAttack = 0;
        if (clearedLineCount > 0) {
            target.combo++;
            sentAttack = (ATTACK_LINES[clearedLineCount] || 0) + (COMBO_ATTACK[target.combo] || Math.max(...COMBO_ATTACK));
        } else {
            target.combo = 0;
        }

        if (gameMode === 'VS_CPU') {
            const opponent = target.isCPU ? player : cpu;
            let netAttack = sentAttack - target.pendingGarbage;
            
            if (netAttack < 0) {
                target.pendingGarbage = Math.abs(netAttack);
                const garbageToReceive = 1;
                setTimeout(() => addGarbageLines(target, garbageToReceive), 500);
                target.pendingGarbage -= garbageToReceive;
            } else {
                target.pendingGarbage = 0;
                if (netAttack > 0) {
                    opponent.pendingGarbage += netAttack;
                }
            }
        }

        updateScoreAndLevel(target, clearedLineCount);
        
        if (!isOver) {
            spawnPiece(target);
            target.canHold = true;
        }
        updateUI();
    }
    
    function clearLines(target) {
        return new Promise(resolve => {
            let fullRows = [];
            for (let y = 0; y < ROWS; y++) {
                if (target.board[y].every(cell => cell)) fullRows.push(y);
            }
            if (fullRows.length === 0) return resolve(0);

            if (!target.isCPU) playSound('delAudio');
            const element = target.isCPU ? cpuBoardEl : boardEl;
            
            target.clearingRows = fullRows;

            if (!lowAnimationMode) {
                fullRows.forEach(y => {
                    for (let x = 0; x < COLS; x++) {
                        const cell = element.children[y * COLS + x];
                        const tile = cell.querySelector('.tile:not(.garbage)');
                        if (tile) {
                            tile.classList.add('clearing');
                        }
                    }
                });
            }

            setTimeout(() => {
                let newBoard = target.board.filter((_, y) => !fullRows.includes(y));
                for (let i = 0; i < fullRows.length; i++) newBoard.unshift(Array(COLS).fill(null));
                target.board = newBoard;
                target.clearingRows = [];
                resolve(fullRows.length);
            }, lowAnimationMode ? 20 : 300); // アニメーション時間に合わせて調整
        });
    }
    
    function addGarbageLines(target, lines) {
        if (target.isOver) return;
        const holeX = Math.floor(Math.random() * COLS);
        for (let i = 0; i < lines; i++) {
            target.board.shift();
            const newRow = Array(COLS).fill('garbage');
            newRow[holeX] = null;
            target.board.push(newRow);
        }
        if (target.currentPiece && !isValidMove(target.currentPiece, target.board)) {
            gameOver(target);
        }
    }

    function updateScoreAndLevel(target, count) {
        if (count === 0) return;
        if (gameMode !== 'SPRINT') target.score += (POINTS[count] || 0) * target.level;
        target.lines += count;
        if (gameMode === 'SPRINT' && target.lines >= 40) { target.lines = 40; gameOver(target); }
        if (count >= 4 && !target.isCPU) showFeedbackPopup(`PERFECT!`);
        if (target.combo > 1 && !target.isCPU) {
            showFeedbackPopup(`${target.combo} COMBO!`);
            if (!lowAnimationMode) {
                const boardWrap = target.isCPU ? cpuContainer.querySelector('.board') : boardEl;
                const comboClass = `combo-${Math.min(4, Math.floor(target.combo / 2))}`;
                boardWrap.classList.add(comboClass);
                setTimeout(() => boardWrap.classList.remove(comboClass), 300);
            }
        }
        if (gameMode === 'TRAINING' || gameMode === 'VS_CPU' || gameMode === 'ULTRA_VS_CPU') {
            const newLevel = Math.floor(target.lines / 10) + 1;
            if (newLevel > target.level) {
                target.level = newLevel;
                if (!target.isCPU) showFeedbackPopup(`Level ${target.level}`);
                target.dropInterval = Math.max(100, 1000 - (target.level - 1) * 50);
            }
        }
    }

    function isValidMove(piece, board) {
        for (let dy = 0; dy < piece.shape.length; dy++) {
            for (let dx = 0; dx < piece.shape[dy].length; dx++) {
                if (piece.shape[dy][dx]) {
                    const bX = piece.x + dx, bY = piece.y + dy;
                    if (bX < 0 || bX >= COLS || bY >= ROWS || (bY >= 0 && board[bY]?.[bX])) return false;
                }
            }
        }
        return true;
    }
    
    function createEmptyBoard(element) { element.innerHTML = Array.from({ length: ROWS * COLS }).map(() => `<div class="cell"></div>`).join(''); }

    function draw(target, element) {
        if (!target || !element || target.isOver) return;
        const cells = Array.from(element.children);
        const clearingRows = target.clearingRows || [];
        
        cells.forEach((c, i) => {
            const y = Math.floor(i / COLS);
            if (!clearingRows.includes(y)) {
                c.innerHTML = '';
            }
        });
        
        target.board.forEach((row, y) => {
            if (clearingRows.includes(y)) return;
            row.forEach((color, x) => {
                if (color) {
                    const tile = document.createElement('div');
                    tile.className = 'tile' + (color === 'garbage' ? ' garbage' : '');
                    if (color !== 'garbage') tile.style.color = color;
                    cells[y * COLS + x].appendChild(tile);
                }
            });
        });

        if (target.currentPiece) {
            let ghostY = target.currentPiece.y;
            while (isValidMove({ ...target.currentPiece, y: ghostY + 1 }, target.board)) ghostY++;
            
            target.currentPiece.shape.forEach((row, dy) => row.forEach((val, dx) => {
                if (val) {
                    const x = target.currentPiece.x + dx;
                    const gy = ghostY + dy;
                    if(ghostY > target.currentPiece.y) {
                        const ghostCellIndex = (ghostY + dy) * COLS + x;
                        if (gy >= 0 && ghostCellIndex < cells.length && cells[ghostCellIndex]) {
                            const ghost = document.createElement('div');
                            ghost.className = 'ghost-tile';
                            cells[ghostCellIndex].appendChild(ghost);
                        }
                    }
                }
            }));
            
            target.currentPiece.shape.forEach((row, dy) => row.forEach((val, dx) => {
                if (val) {
                    const x = target.currentPiece.x + dx;
                    const y = target.currentPiece.y + dy;
                    if (y >= 0) {
                        const cellIndex = y * COLS + x;
                        if(cellIndex >=0 && cellIndex < cells.length && cells[cellIndex]) {
                            const tile = document.createElement('div');
                            tile.className = 'tile';
                            tile.style.color = target.currentPiece.color;
                            cells[cellIndex].appendChild(tile);
                        }
                    }
                }
            }));
        }
        if(devHUD.enabled) devHUD.perf.drawCalls++;
    }

    function drawPreview(container, piece) {
        container.innerHTML = ''; if (!piece) return;
        const grid = document.createElement('div'); grid.className = 'piece-grid';
        const shape = TETROMINOS[piece.name].shape;
        let minR = 4, maxR = -1, minC = 4, maxC = -1;
        shape.forEach((r, y) => r.forEach((v, x) => { if (v) { minR = Math.min(minR, y); maxR = Math.max(maxR, y); minC = Math.min(minC, x); maxC = Math.max(maxC, x); } }));
        const h = maxR - minR + 1, w = maxC - minC + 1;
        grid.innerHTML = Array(16).fill('<div class="mini-cell"></div>').join('');
        for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
            if (shape[minR + r][minC + c]) {
                const sr = piece.name === 'I' ? 1 : Math.floor((4 - h) / 2);
                const sc = Math.floor((4 - w) / 2);
                const i = (sr + r) * 4 + (sc + c);
                const t = document.createElement('div'); t.className = 'tile'; t.style.color = piece.color;
                if (grid.children[i]) grid.children[i].appendChild(t);
            }
        }
        container.appendChild(grid);
    }

    function setupUI() {
        highScoreEl.textContent = bestScores.training || 0;
        currentScoreEl.textContent = 0;
        linesEl.textContent = 0;
        levelEl.textContent = 1;
        gameOverlay.classList.remove('hidden');
        appContainer.classList.add('game-inactive-blur');
    }

    function updateUI() {
        if (!player) return;
        currentScoreEl.textContent = player.score;
        linesEl.textContent = player.lines;
        levelEl.textContent = player.level;
        let infoHtml = '';
        switch (gameMode) {
            case 'TRAINING': highScoreEl.textContent = bestScores.training || 0; modeInfoPanel.classList.add('hidden'); break;
            case 'SPRINT': modeInfoTitle.textContent = "SPRINT"; infoHtml = `<div class="scorebox"><span>TIME</span><span>${formatTime(gameTimer)}</span></div><div class="scorebox"><span>BEST</span><span>${bestScores.sprint === Infinity ? 'N/A' : formatTime(bestScores.sprint)}</span></div><div class="scorebox"><span>LINES LEFT</span><span>${Math.max(0, 40 - player.lines)}</span></div>`; modeInfoPanel.classList.remove('hidden'); break;
            case 'ULTRA': modeInfoTitle.textContent = "ULTRA"; infoHtml = `<div class="scorebox"><span>TIME LEFT</span><span>${formatTime(gameTimer)}</span></div><div class="scorebox"><span>HIGH</span><span>${bestScores.ultra || 0}</span></div><div class="scorebox"><span>SCORE</span><span>${player.score}</span></div>`; modeInfoPanel.classList.remove('hidden'); break;
            case 'VS_CPU': modeInfoTitle.textContent = "VS CPU"; infoHtml = `<div class="scorebox"><span>CPU SCORE</span><span>${cpu?.score || 0}</span></div>`; modeInfoPanel.classList.remove('hidden'); break;
            case 'ULTRA_VS_CPU': modeInfoTitle.textContent = "ULTRA VS CPU"; infoHtml = `<div class="scorebox"><span>TIME LEFT</span><span>${formatTime(gameTimer)}</span></div><div class="scorebox"><span>CPU SCORE</span><span>${cpu?.score || 0}</span></div>`; modeInfoPanel.classList.remove('hidden'); break;
        }
        modeInfoContent.innerHTML = infoHtml;
        
        if (gameMode === 'VS_CPU' || gameMode === 'ULTRA_VS_CPU') {
            drawPreview(playerNextContainerVS, player.nextPiece);
        } else {
            drawPreview(nextContainer, player.nextPiece);
        }
        drawPreview(holdContainer, player.heldPiece);
        
        if(cpu) {
            drawPreview(cpuNextContainer, cpu.nextPiece);
            drawPreview(cpuHoldContainer, cpu.heldPiece);
        }

        if(devHUD.enabled) {
          devHUD.progress.mode = gameMode; devHUD.progress.score = player.score; devHUD.progress.level = player.level; devHUD.progress.lines = player.lines; devHUD.progress.isOver = isOver;
          devHUD.data.currentPiece = player.currentPiece?.name || 'None'; devHUD.data.nextPiece = player.nextPiece?.name || 'None'; devHUD.data.heldPiece = player.heldPiece?.name || 'None';
        }
    }

    function gameOver(loser) {
        if (isOver) return;
        isOver = true;
        if (loser) loser.isOver = true;
        
        clearAllInputTimers();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (gameInterval) clearInterval(gameInterval);
        if (cpuActionInterval) clearInterval(cpuActionInterval);

        const processResults = () => {
            const titleEl = gameoverScreen.querySelector('h2');
            titleEl.style.animation = 'none';
            void titleEl.offsetWidth;
            titleEl.style.animation = null; 

            if (gameMode === 'VS_CPU') {
                titleEl.textContent = loser.isCPU ? "YOU WIN!" : "YOU LOSE...";
                gameoverResult.textContent = `CPU LV.${cpuLevel} との対戦結果`;
            } else if (gameMode === 'ULTRA_VS_CPU') {
                titleEl.textContent = "TIME UP!";
                gameoverResult.textContent = `You: ${player.score} vs CPU: ${cpu.score}`;
                 if (player.score > cpu.score) {
                    showFeedbackPopup("YOU WIN!");
                } else if (player.score < cpu.score) {
                    showFeedbackPopup("YOU LOSE...");
                } else {
                    showFeedbackPopup("DRAW!");
                }
            }
            else {
                switch (gameMode) {
                    case 'TRAINING': titleEl.textContent = "TRAINING COMPLETE"; gameoverResult.textContent = `Score: ${player.score}`; if (player.score > (bestScores.training || 0)) { bestScores.training = player.score; saveBestScores(); showFeedbackPopup("New High Score!"); } break;
                    case 'SPRINT': titleEl.textContent = "SPRINT COMPLETE"; gameoverResult.textContent = `Time: ${formatTime(gameTimer)}`; if (player.lines >= 40 && gameTimer < (bestScores.sprint || Infinity)) { bestScores.sprint = gameTimer; saveBestScores(); showFeedbackPopup("New Best Time!"); } break;
                    case 'ULTRA': titleEl.textContent = "TIME UP!"; gameoverResult.textContent = `Score: ${player.score}`; if (player.score > (bestScores.ultra || 0)) { bestScores.ultra = player.score; saveBestScores(); showFeedbackPopup("New High Score!"); } break;
                }
            }
            showGameOverScreen();
        };
        playGameOverAnimation(loser).then(processResults);
    }

    function showStartScreen() {
        if (countdownInterval) clearInterval(countdownInterval);
        if (gameInterval) clearInterval(gameInterval);
        if (cpuActionInterval) clearInterval(cpuActionInterval);
        appContainer.className = 'app single-player-mode';
        cpuContainer.classList.add('hidden');
        playerNextPanelVS.classList.add('hidden');
        cpuInfoPanel.classList.add('hidden');
        spNextPanel.classList.remove('hidden');
        document.querySelector('.side-panel.right').style.display = '';

        countdownEl.classList.add('hidden');
        gameOverlay.classList.remove('hidden');
        startScreen.classList.remove('hidden');
        gameoverScreen.classList.add('hidden');
        pauseScreen.classList.add('hidden');
        appContainer.classList.add('game-inactive-blur');
        isOver = true; isPaused = true;
        createEmptyBoard(boardEl); if(cpuBoardEl) createEmptyBoard(cpuBoardEl);
        setupUI();
        pauseButton.textContent = "停止";
        vsCpuSelect.classList.remove('open');
        ultraVsCpuSelect.classList.remove('open');
    }

    function showGameOverScreen() { gameOverlay.classList.remove('hidden'); startScreen.classList.add('hidden'); gameoverScreen.classList.remove('hidden'); pauseScreen.classList.add('hidden'); appContainer.classList.add('game-inactive-blur'); }
    function saveBestScores() { try { localStorage.setItem('blockfall_bests', JSON.stringify(bestScores)); } catch (e) { console.error("Failed to save scores:", e); } }
    function loadBestScores() {
        try { const l = JSON.parse(localStorage.getItem('blockfall_bests')); return l ? { training: l.training || 0, sprint: l.sprint ?? Infinity, ultra: l.ultra || 0 } : { training: 0, sprint: Infinity, ultra: 0 };
        } catch (e) { return { training: 0, sprint: Infinity, ultra: 0 }; }
    }
    function formatTime(s) { const m = Math.floor(s / 60); const sec = s % 60; return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; }
    
    function clearAllInputTimers() { clearTimeout(dasTimer); clearInterval(arrTimer); clearInterval(softDropTimer); dasTimer = null; arrTimer = null; softDropTimer = null; }

    function setupKeyHandlers() {
        document.addEventListener('keydown', e => {
            if (actionToChange) return;
            if (e.key === 'Enter' && !e.target.closest('.modal-overlay')) { document.getElementById('fake-translator').classList.toggle('hidden'); return; }
            if (e.key === 'Escape' && !isOver && !document.querySelector('.modal-overlay:not(.hidden)')) { e.preventDefault(); togglePause(); return; }
            if (isPaused || isOver || (player && player.isOver) || document.querySelector('.modal-overlay:not(.hidden)')) return;
            if (!keys[e.key]) { 
                const action = Object.keys(keyMap).find(act => keyMap[act].toLowerCase() === e.key.toLowerCase()); 
                if (action) {
                    e.preventDefault();
                    handleKeyPress(action); 
                }
            }
            keys[e.key] = true;
        });
        document.addEventListener('keyup', e => {
            const action = Object.keys(keyMap).find(act => keyMap[act].toLowerCase() === e.key.toLowerCase());
            if (action === 'moveLeft' || action === 'moveRight') { 
                clearTimeout(dasTimer); 
                clearInterval(arrTimer); 
                dasTimer = null; 
                arrTimer = null;
            }
            if (action === 'softDrop') { 
                clearInterval(softDropTimer); 
                softDropTimer = null; 
            }
            keys[e.key] = false;
        });
        window.addEventListener('blur', () => { keys = {}; clearAllInputTimers(); });
    }

    function handleKeyPress(action) {
        if (isOver || isPaused || player.isOver) return;
        switch (action) {
            case 'moveLeft': if(!dasTimer) { move(player, -1); dasTimer = setTimeout(() => { arrTimer = setInterval(() => move(player, -1), ARR_DELAY); }, DAS_DELAY); } break;
            case 'moveRight': if(!dasTimer) { move(player, 1); dasTimer = setTimeout(() => { arrTimer = setInterval(() => move(player, 1), ARR_DELAY); }, DAS_DELAY); } break;
            case 'softDrop': if(!softDropTimer) { drop(player); softDropTimer = setInterval(() => drop(player), SOFT_DROP_DELAY); } break;
            case 'hardDrop': hardDrop(player); break;
            case 'rotateLeft': rotate(player, -1); break;
            case 'rotateRight': rotate(player, 1); break;
            case 'hold': hold(player); break;
        }
    }

    // ▼ ハードドロップのアニメーションを軽量化（パーティクルを削除）▼
    function playHardDropAnimation(target) {
        if (lowAnimationMode) return;
        // パーティクル生成ロジックは重いため削除
    }
    
    function playGameOverAnimation(target) {
        return new Promise(resolve => {
            if (!target || target.isOver === false) {
                if(document.querySelector('.overlay-content h2')) document.querySelector('.overlay-content h2').style.animation = 'none';
                 return resolve();
            }
            let row = ROWS - 1;
            const el = target.isCPU ? cpuBoardEl : boardEl;
            const i = setInterval(() => {
                if (row < 0) { clearInterval(i); setTimeout(resolve, 300); return; }
                for (let c = 0; c < COLS; c++) el.children[row * COLS + c].classList.add('dead');
                row--;
            }, 30);
        });
    }
    function playSound(id) { if (!soundToggle.checked) return; const a = document.getElementById(id); if (a) { a.currentTime = 0; a.play().catch(() => {}); } }
    function showFeedbackPopup(text) { const p = document.createElement('div'); p.textContent = text; p.className = 'feedback-popup'; document.body.appendChild(p); p.addEventListener('animationend', () => p.remove()); }
    function loadKeyMap() { try { const s = JSON.parse(localStorage.getItem('blockfall_keymap')); keyMap = s ? { ...defaultKeyMap, ...s } : { ...defaultKeyMap }; } catch (e) { keyMap = { ...defaultKeyMap }; } }
    function saveKeyMap() { try { localStorage.setItem('blockfall_keymap', JSON.stringify(keyMap)); } catch (e) { alert('設定の保存に失敗しました。'); } }
    function setupKeyConfigModal() {
        const modal = document.getElementById('keyConfigModal'), keyConfigList = document.getElementById('key-config-list'), saveBtn = document.getElementById('saveKeysBtn'), resetBtn = document.getElementById('resetKeysBtn');
        document.getElementById('menu-key-config-btn').addEventListener('click', () => { populateKeyConfigList(); modal.classList.remove('hidden'); });
        saveBtn.addEventListener('click', () => { saveKeyMap(); modal.classList.add('hidden'); showFeedbackPopup('キー設定を保存しました'); });
        resetBtn.addEventListener('click', () => { if (confirm('キー設定を初期状態に戻しますか？')) { keyMap = { ...defaultKeyMap }; populateKeyConfigList(); } });
        modal.addEventListener('click', (e) => { if (e.target === modal) { modal.classList.add('hidden'); } });
        function populateKeyConfigList() {
            keyConfigList.innerHTML = '';
            for (const action in actionLabels) { const item = document.createElement('div'); item.className = 'key-config-item'; item.innerHTML = `<span class="action-label">${actionLabels[action]}</span><span class="key-display" data-action="${action}">${keyMap[action]}</span>`; keyConfigList.appendChild(item); }
            document.querySelectorAll('.key-display').forEach(el => { el.addEventListener('click', startKeyChange); });
        }
        function startKeyChange(e) { if (actionToChange) return; const targetEl = e.target; actionToChange = targetEl.dataset.action; targetEl.textContent = 'キーを押して下さい'; targetEl.classList.add('listening'); document.addEventListener('keydown', captureKey, { capture: true, once: true }); document.addEventListener('click', cancelKeyChange, { once: true }); }
        function captureKey(e) {
            e.preventDefault(); e.stopPropagation();
            const newKey = e.key; const currentEl = document.querySelector(`.key-display[data-action="${actionToChange}"]`);
            if (newKey === 'Escape') { if (currentEl) currentEl.textContent = keyMap[actionToChange]; }
            else {
                const isUsed = Object.values(keyMap).some(k => k.toLowerCase() === newKey.toLowerCase());
                if (isUsed && keyMap[actionToChange].toLowerCase() !== newKey.toLowerCase()) { alert(`キー「${newKey}」は既に使用されています。`); if (currentEl) currentEl.textContent = keyMap[actionToChange]; }
                else { keyMap[actionToChange] = newKey; if (currentEl) currentEl.textContent = newKey; }
            }
            if (currentEl) currentEl.classList.remove('listening');
            document.removeEventListener('click', cancelKeyChange);
            actionToChange = null;
        }
        function cancelKeyChange(e) { if (e.target.dataset.action !== actionToChange) { const currentEl = document.querySelector(`.key-display[data-action="${actionToChange}"]`); if (currentEl) { currentEl.textContent = keyMap[actionToChange]; currentEl.classList.remove('listening'); } document.removeEventListener('keydown', captureKey, { capture: true }); actionToChange = null; } }
    }

    function setupExtraFeatures() {
        const cheatCodeModal = document.getElementById('cheatCodeModal'), cheatInput = document.getElementById('cheatInput'), submitCheatBtn = document.getElementById('submitCheatBtn'), closeCheatBtn = document.getElementById('closeCheatBtn');
        menuCheatBtn.addEventListener('click', () => { cheatCodeModal?.classList.remove('hidden'); menuPanel.classList.remove('open'); });
        if (closeCheatBtn) closeCheatBtn.addEventListener('click', () => cheatCodeModal.classList.add('hidden'));
        if (submitCheatBtn) submitCheatBtn.addEventListener('click', handleCheatCode);
        if (cheatInput) cheatInput.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') handleCheatCode(); });
        
        const menuShareBtn = document.getElementById('menu-share-btn'), shareModal = document.getElementById('shareModal'), qrcodeContainer = document.getElementById('qrcode'), urlInput = document.getElementById('urlInput'), copyUrlBtn = document.getElementById('copyUrlBtn'), closeShareBtn = document.getElementById('closeShareBtn'), bgmAudio = document.getElementById('bgmAudio'), translatorInput = document.getElementById('translator-input'), translatorOutput = document.getElementById('translator-output');
        hamburgerIcon.addEventListener('click', () => menuPanel.classList.toggle('open'));
        const savedSoundSetting = localStorage.getItem('blockfall_sound');
        if (savedSoundSetting !== null) soundToggle.checked = savedSoundSetting === 'true';
        const playBGM = () => { if (soundToggle.checked && bgmAudio) bgmAudio.play().catch(() => {}); };
        document.body.addEventListener('click', playBGM, { once: true });
        soundToggle.addEventListener('change', (e) => { try { localStorage.setItem('blockfall_sound', e.target.checked); } catch (err) {} if (e.target.checked && bgmAudio) bgmAudio.play().catch(() => {}); else if (bgmAudio) bgmAudio.pause(); });
        if (menuShareBtn) menuShareBtn.addEventListener('click', () => { if (!shareModal) return; const url = window.location.href; if (urlInput) urlInput.value = url; if (qrcodeContainer) qrcodeContainer.innerHTML = ''; if (typeof QRCode !== 'undefined') { QRCode.toCanvas(url, { width: 200, errorCorrectionLevel: 'H' }, (err, canvas) => { if (err) { console.error(err); return; } if (qrcodeContainer) qrcodeContainer.appendChild(canvas); }); } shareModal.classList.remove('hidden'); menuPanel.classList.remove('open'); });
        if (closeShareBtn) closeShareBtn.addEventListener('click', () => shareModal.classList.add('hidden'));
        if (copyUrlBtn) copyUrlBtn.addEventListener('click', () => { if (urlInput) { urlInput.select(); navigator.clipboard.writeText(urlInput.value).then(() => { copyUrlBtn.textContent = 'コピー完了!'; setTimeout(() => { copyUrlBtn.textContent = 'コピー'; }, 2000); }); } });
        const originalTitle = document.title, favicon = document.getElementById('favicon'), originalFavicon = favicon ? favicon.href : '', fakeTitle = '翻訳', fakeFavicon = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>';
        window.addEventListener('blur', () => { document.title = fakeTitle; if (favicon) favicon.href = fakeFavicon; });
        window.addEventListener('focus', () => { document.title = originalTitle; if (favicon) favicon.href = originalFavicon; });
        if (translatorInput) { translatorInput.addEventListener('keyup', () => { if (translatorOutput) translatorOutput.value = translatorInput.value.toLowerCase().split('').map(char => ({ 'a': 'b', 'あ': 'い', 'i': 'j' })[char] || char).join(''); }); }
    }

    function handleCheatCode() {
        const cheatInput = document.getElementById('cheatInput'), cheatCodeModal = document.getElementById('cheatCodeModal');
        const code = cheatInput.value.trim().toLowerCase();
        if (code === 'towa.soko0406') {
            const newScoreStr = prompt('新しいスコアを入力:', player.score);
            const newScore = parseInt(newScoreStr, 10);
            if (!isNaN(newScore)) { player.score = newScore; updateUI(); } else { alert('無効な数値'); }
        } else if (code === 'deletadata' || code === 'reset') {
            try { localStorage.removeItem('blockfall_bests'); localStorage.removeItem('blockfall_keymap'); localStorage.removeItem('blockfall_sound'); alert('全モードのハイスコアとキー設定を削除しました'); location.reload(); } catch (e) { alert('削除失敗'); }
        } else { alert('コードが違います'); }
        if (cheatInput) cheatInput.value = '';
        if (cheatCodeModal) cheatCodeModal.classList.add('hidden');
    }

    function setupDevMode() {
        const devPasswordModal = document.getElementById('devPasswordModal'), devPasswordInput = document.getElementById('devPasswordInput'), submitDevPasswordBtn = document.getElementById('submitDevPasswordBtn'), closeDevPasswordBtn = document.getElementById('closeDevPasswordBtn');
        document.getElementById('menu-dev-mode-btn').addEventListener('click', () => { devPasswordModal.classList.remove('hidden'); devPasswordInput.focus(); menuPanel.classList.remove('open'); });
        closeDevPasswordBtn.addEventListener('click', () => devPasswordModal.classList.add('hidden'));
        submitDevPasswordBtn.addEventListener('click', handleDevPassword);
        devPasswordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleDevPassword(); });
        devHUD.elements.hud.addEventListener('click', (e) => {
            if (!devHUD.enabled || e.target.dataset.action !== 'set-score') return;
            const newScoreStr = prompt('新しいスコアを入力してください:', player.score);
            const newScore = parseInt(newScoreStr, 10);
            if (!isNaN(newScore) && newScore >= 0) { player.score = newScore; logToDevConsole(`Score changed to ${player.score}`); updateUI(); }
            else { alert('無効な数値です。'); }
        });
    }
    function handleDevPassword() {
        const devPasswordInput = document.getElementById('devPasswordInput'), devPasswordModal = document.getElementById('devPasswordModal');
        const password = devPasswordInput.value.trim();
        if (password === 'towa.soko0406') {
            devHUD.enabled = !devHUD.enabled;
            devHUD.debug.flags.devMode = devHUD.enabled;
            devHUD.debug.flags.lowAnim = lowAnimationMode;
            if (devHUD.enabled) { devHUD.elements.hud.classList.remove('hidden'); devHUD.elements.console.classList.remove('hidden'); alert('開発者モードが有効になりました。'); } 
            else { devHUD.elements.hud.classList.add('hidden'); devHUD.elements.console.classList.add('hidden'); alert('開発者モードが無効になりました。'); }
        } else if (password === 'reset') {
            if (confirm('本当に保存されているデータを全てリセットしますか？')) {
                try { localStorage.clear(); alert('データをリセットしました。ページをリロードします。'); location.reload(); } 
                catch (e) { alert('データのリセットに失敗しました。'); }
            }
        } else { alert('パスワードが違います。'); }
        devPasswordModal.classList.add('hidden');
        devPasswordInput.value = '';
    }

    function runCpuTurn(cpu) {
        if (isOver || cpu.isOver || !cpu.currentPiece || cpu.ai.isThinking) return;
        cpu.ai.isThinking = true;
        setTimeout(() => {
            const bestMoves = findBestMoves(cpu);
            if (!bestMoves || bestMoves.length === 0) { cpu.ai.isThinking = false; return; }
            let bestMove;
            
            if (cpuLevel <= 6 && Math.random() < 0.04) {
                bestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
            } else {
                bestMove = bestMoves[0];
                if (Math.random() < CPU_LEVELS[cpuLevel].mistakeChance && bestMoves.length > 1) {
                    bestMove = bestMoves[1 + Math.floor(Math.random() * Math.min(2, bestMoves.length - 1))];
                }
            }

            cpu.ai.actionQueue = planCpuMoves(cpu, bestMove.move);
            cpu.ai.isThinking = false;
        }, CPU_LEVELS[cpuLevel].thinkTime + Math.random() * 50);
    }
    function planCpuMoves(cpu, bestMove) {
        if (!bestMove || !cpu.currentPiece) return [];
        const queue = [];
        if (bestMove.isHold) { queue.push('hold'); return queue; }
        const p = { ...cpu.currentPiece, shape: JSON.parse(JSON.stringify(cpu.currentPiece.shape))};
        for(let i = 0; i < bestMove.rotation; i++) { queue.push('rotate'); }
        const finalX = bestMove.x;
        let startX = p.x;
        const moveDiff = finalX - startX;
        const moveDir = moveDiff > 0 ? 'moveRight' : 'moveLeft';
        for (let i = 0; i < Math.abs(moveDiff); i++) queue.push(moveDir);
        queue.push('hardDrop');
        return queue;
    }
    function executeCpuAction() {
        const action = cpu.ai.actionQueue.shift();
        if (!action) return;
        switch (action) {
            case 'rotate': rotate(cpu, 1); break;
            case 'moveLeft': move(cpu, -1); break;
            case 'moveRight': move(cpu, 1); break;
            case 'hardDrop': hardDrop(cpu); break;
            case 'hold': hold(cpu); break;
        }
    }
    function findBestMoves(target) {
        let moves = [];
        const checkPiece = (piece, isHold) => {
            if (!piece) return;
            for (let r = 0; r < 4; r++) {
                let tempPiece = { ...piece, rotation: 0, shape: JSON.parse(JSON.stringify(TETROMINOS[piece.name].shape)) };
                for(let i = 0; i < r; i++) {
                    tempPiece.shape = tempPiece.shape[0].map((_, c) => tempPiece.shape.map(row => row[c]).reverse());
                    tempPiece.rotation = (tempPiece.rotation + 1) % 4;
                }
                
                for (let x = -2; x < COLS; x++) {
                    tempPiece.x = x;
                    tempPiece.y = 0;
                    let y = 0;
                    while (isValidMove({ ...tempPiece, y: y + 1 }, target.board)) y++;
                    tempPiece.y = y;
                    if (!isValidMove(tempPiece, target.board)) continue;

                    let tempBoard = target.board.map(row => [...row]);
                    tempPiece.shape.forEach((row, dy) => row.forEach((v, dx) => { if (v && tempPiece.y + dy >= 0) tempBoard[tempPiece.y + dy][tempPiece.x + dx] = '1'; }));
                    moves.push({ move: { rotation: r, x: tempPiece.x, isHold }, score: evaluateBoard(tempBoard, CPU_LEVELS[cpuLevel].weights) });
                }
            }
        };
        checkPiece(target.currentPiece, false);
        if (target.canHold) {
            const pieceToConsider = target.heldPiece || target.nextPiece;
            checkPiece(pieceToConsider, true);
        }
        return moves.sort((a, b) => b.score - a.score);
    }
    function evaluateBoard(board, weights) {
        const {AGG_H, COMP_L, HOLES, BUMP, WELLS} = weights;
        const heights = Array(COLS).fill(0);
        let aggHeight = 0, holes = 0;
        for (let c = 0; c < COLS; c++) {
            let blockFound = false;
            for (let r = 0; r < ROWS; r++) {
                if (board[r][c]) {
                    if (!blockFound) { heights[c] = ROWS - r; blockFound = true; }
                } else if (blockFound) holes++;
            }
            aggHeight += heights[c];
        }
        let completedLines = 0;
        for (let r = 0; r < ROWS; r++) if (board[r].every(cell => cell)) completedLines++;
        let bumpiness = 0, wells = 0;
        for (let c = 0; c < COLS; c++) {
            if (c > 0) bumpiness += Math.abs(heights[c] - heights[c - 1]);
            const left = heights[c - 1] || ROWS, right = heights[c + 1] || ROWS;
            if (left > heights[c] && right > heights[c]) wells += Math.min(left - heights[c], right - heights[c]);
        }
        return AGG_H * aggHeight + COMP_L * (completedLines ** 2) + HOLES * holes + BUMP * bumpiness + WELLS * wells;
    }
    
    init();
}