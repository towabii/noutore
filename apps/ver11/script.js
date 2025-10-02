// ===================================================================================
// ゲーム設定オブジェクト
// ここを編集するだけで、アップデート情報やランキングを簡単に変更できます。
// ===================================================================================
const GAME_CONFIG = {
  SOKOHARA_RECORD: "底原永和の最高記録: 62000",
  UPDATE_INFO: {
    title: "アップデート情報",
    sections: [
      {
        header: "今回の修正・追加",
        items: [
          "効果音・BGMを追加。",
          "ばれないためのタブでの表示変更を追加。",
          "枠の境目が見やすいように修正。",
          "ブロックのアニメーション強化。",
          "コード入力欄を追加。",
          "開発者モードを追加。",
          "「通常モード」と「3分ウルトラモード」を追加。",
          "ランキング機能を追加。"
        ]
      },
      {
        header: "追加予定",
        items: ["CPU対戦機能"]
      }
    ],
    notices: [
      {
        header: "機能追加のお知らせ",
        text: "ランキング機能を追加(手動追加)"
      },
      {
        header: "注意",
        text: "先生に注意されたり、先生に怒られたりした場合でも底原永和は責任を取りません。あと、音量注意"
      }
    ]
  },
  RANKINGS: {
    normal: [
      { rank: 1, name: "匿名()", score: 72000 },
      { rank: 2, name: "底原永和", score: 62000 },
      { rank: 3, name: "募集", score: 0 },
      { rank: 4, name: "募集", score: 0 },
      { rank: 5, name: "募集", score: 0 },
    ],
    ultra: [
      { rank: 1, name: "底原永和", score: 125000 },
      { rank: 2, name: "募集", score: 0 },
      { rank: 3, name: "募集", score: 0 },
    ],
    developer: [
      { rank: 1, name: "底原永和", score: "62000" }
    ]
  }
};


// ===================================================================================
// ゲーム本体のコード
// ===================================================================================
let wasSkipPressed = false;

window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const staffRollContainer = document.getElementById('staffRollContainer');
  const loadComplete = document.getElementById('loadComplete');
  const skipBtn = document.getElementById('skipBtn');
  const staffRollDuration = 14000;
  const logoDuration = 5000;
  const totalLoadTime = staffRollDuration + logoDuration;
  let logoTimer;
  let startTimer;

  const startAppFlow = () => {
    if (loader.parentNode) {
      loader.classList.add('fade-out');
      loader.addEventListener('animationend', () => {
        if (loader.parentNode) loader.remove();
        document.body.style.overflow = 'auto';
      });
      initGameFlow(); 
    }
  };

  const skipLoading = () => {
    wasSkipPressed = true;
    clearTimeout(logoTimer);
    clearTimeout(startTimer);
    startAppFlow();
  };

  logoTimer = setTimeout(() => {
    staffRollContainer.classList.add('fade-out');
    loadComplete.classList.remove('hidden');
    loadComplete.classList.add('fade-in');
  }, staffRollDuration);

  startTimer = setTimeout(startAppFlow, totalLoadTime);
  skipBtn.addEventListener('click', skipLoading);
  
  initGame();
});

function initGameFlow() {
    showUpdateInfo();
}

// ========== 開発者モードHUDここから ==========
const devHUD = {
    enabled: false,
    elements: {
      hud: document.getElementById('dev-hud'),
      console: document.getElementById('dev-console'),
    },
    perf: { lastTime: performance.now(), frames: 0, fps: 0, frameTime: 0, cpuUsage: 0, memory: 'N/A', drawCalls: 0 },
    progress: { round: 1, playTime: 0, startTime: performance.now(), isOver: false, mode: 'normal' },
    graphics: { spriteCount: 0, canvasSize: '0x0', devicePixelRatio: window.devicePixelRatio || 1 },
    input: { lastKey: 'N/A', history: [], mouse: { x: 0, y: 0 }, clicks: 0 },
    data: { objectCount: 0, blockCounts: {}, selectedPiece: 'None', rngSeed: 'N/A' },
    system: { userAgent: navigator.userAgent.substring(0, 40) + '...', windowSize: `${window.innerWidth}x${window.innerHeight}`, refreshRate: 'N/A' },
    debug: { errors: [], flags: { devMode: false }, zIndexes: 'HUD:9999, Modal:1000' }
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
    const fpsClass = devHUD.perf.fps >= 50 ? 'fps-good' : devHUD.perf.fps >= 30 ? 'fps-warn' : 'fps-bad';
    const blockCountsStr = Object.entries(devHUD.data.blockCounts).map(([color, count]) => `<span style="color:${color};">■</span>:${count}`).join(' ');
    const hudText = `
<div>
--[ 📊 PERFORMANCE ]---------
FPS        : <span class="${fpsClass}">${devHUD.perf.fps}</span> / Frame Time : ${devHUD.perf.frameTime.toFixed(2)} ms
CPU Usage  : ${devHUD.perf.cpuUsage.toFixed(1)} % / Memory : ${devHUD.perf.memory}
--[ 🚀 PROGRESS ]------------
Mode       : ${devHUD.progress.mode} / Round : ${devHUD.progress.round}
Time       : ${devHUD.progress.playTime.toFixed(1)} s / Finished: ${devHUD.progress.isOver}
--[ 🧩 INTERNAL DATA ]-------
Objects    : ${devHUD.data.objectCount} / Selected: ${devHUD.data.selectedPiece}
Block Types: ${blockCountsStr}
</div>
<div>
--[ 🔧 CONTROLS ]------------
<div class="dev-controls-panel">
  Score Controls:
  <button data-action="add-score">+1000</button>
  <button data-action="sub-score">-1000</button>
  <button data-action="set-score">Set Score</button>
</div>
</div>`;
    devHUD.elements.hud.innerHTML = hudText.trim();
    devHUD.perf.drawCalls = 0;
    requestAnimationFrame(updateDevHUD);
}
  
function logToDevConsole(message, type = 'log') { if (!devHUD.enabled) return; const p = document.createElement('p'); p.className = `log-${type}`; p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`; devHUD.elements.console.appendChild(p); devHUD.elements.console.scrollTop = devHUD.elements.console.scrollHeight; }
window.addEventListener('keydown', e => { devHUD.input.lastKey = e.key; devHUD.input.history.unshift(e.key); if (devHUD.input.history.length > 5) devHUD.input.history.pop(); });
window.addEventListener('mousemove', e => { devHUD.input.mouse = { x: e.clientX, y: e.clientY }; });
window.addEventListener('click', () => devHUD.input.clicks++);
window.addEventListener('resize', () => { devHUD.system.windowSize = `${window.innerWidth}x${window.innerHeight}`; });
window.addEventListener('error', (event) => { const errorMsg = `${event.message} at ${event.filename}:${event.lineno}`; devHUD.debug.errors.push(errorMsg); logToDevConsole(errorMsg, 'error'); });
requestAnimationFrame(updateDevHUD);
// ========== 開発者モードHUDここまで ==========

function initGame(){
    const ROWS = 8, COLS = 8, PIECE_COUNT = 3, BASE_POINTS_PER_LINE = 100, LATE_GAME_SCORE = 10000;
    const ULTRA_MODE_DURATION = 180;
    const COLORS = ['#FF6B6B', '#FFD166', '#06D6A0', '#4D96FF', '#9B5DE5', '#FF7AB6'];
    const SHAPES = [ [[0,0]], [[0,0],[0,1]], [[0,0],[0,1],[0,2]], [[0,0],[0,1],[0,2],[0,3]], [[0,0],[1,0],[2,0]], [[0,0],[0,1],[1,0],[1,1]], [[0,0],[0,1],[1,0]], [[0,0],[0,1],[1,1]], [[0,0],[1,0],[1,1]], [[0,1],[1,0],[1,1],[1,2]], [[0,0],[0,1],[1,1],[1,2]], [[0,1],[0,2],[1,0],[1,1]], [[0,0],[1,1]], [[0,1],[1,0]], [[0,0],[1,0],[2,0],[2,1]], [[0,1],[1,1],[2,1],[2,0]], [[0,1],[1,1],[2,1],[0,0]], [[0,0],[1,0],[2,0],[0,1]] ];
    const BONUS_SHAPES = [ [[0,0]], [[0,0],[0,1]], [[0,0],[1,0]] ];
    const board = new Array(ROWS).fill(0).map(()=>new Array(COLS).fill(null));
    let pieces = [], selectedPieceIndex = -1, score = 0, best = 0, isOver = false, hintLocation = null, turnCount = 0, comboCount = 0, comboTurnsLeft = 0, isSoundEnabled = true;
    let currentMode = 'normal';
    let gameTimer = ULTRA_MODE_DURATION;
    let timerInterval = null;

    const appContainer = document.getElementById('appContainer');
    const boardEl = document.getElementById('board'), piecesContainer = document.getElementById('piecesContainer'), scoreBox = document.getElementById('scoreBox'), highBox = document.getElementById('highBox'), currentScoreEl = document.getElementById('currentScore'), bestScoreEl = document.getElementById('bestScore'), restartBtn = document.getElementById('restartBtn'), hintBtn = document.getElementById('hintBtn'), gamePanel = document.getElementById('gamePanel'), noticeModal = document.getElementById('noticeModal'), cheatCodeModal = document.getElementById('cheatCodeModal'), cheatInput = document.getElementById('cheatInput'), submitCheatBtn = document.getElementById('submitCheatBtn'), closeCheatBtn = document.getElementById('closeCheatBtn'), hamburgerIcon = document.getElementById('hamburger-icon'), menuPanel = document.getElementById('menu-panel'), menuRestartBtn = document.getElementById('menu-restart-btn'), soundToggle = document.getElementById('sound-toggle'), menuShareBtn = document.getElementById('menu-share-btn'), shareModal = document.getElementById('shareModal'), qrcodeContainer = document.getElementById('qrcode'), urlInput = document.getElementById('urlInput'), copyUrlBtn = document.getElementById('copyUrlBtn'), closeShareBtn = document.getElementById('closeShareBtn'), bgmAudio = document.getElementById('bgmAudio'), pushAudio = document.getElementById('pushAudio'), delAudio = document.getElementById('delAudio');
    const fakeTranslator = document.getElementById('fake-translator'), translateBtn = document.getElementById('translate-btn'), translatorInput = document.getElementById('translator-input'), translatorOutput = document.getElementById('translator-output');
    const menuDevModeBtn = document.getElementById('menu-dev-mode-btn'), devPasswordModal = document.getElementById('devPasswordModal'), devPasswordInput = document.getElementById('devPasswordInput'), submitDevPasswordBtn = document.getElementById('submitDevPasswordBtn'), closeDevPasswordBtn = document.getElementById('closeDevPasswordBtn');
    const sokoharaRecordEl = document.getElementById('sokohara-record');
    const rankingModal = document.getElementById('rankingModal');
    const modeSelectModal = document.getElementById('modeSelectModal');
    const menuRankingBtn = document.getElementById('menu-ranking-btn');
    const timerBox = document.getElementById('timerBox');
    const modeBox = document.getElementById('modeBox');

    function createBoard(){ boardEl.innerHTML = ''; for(let r=0;r<ROWS;r++){ for(let c=0;c<COLS;c++){ const cell = document.createElement('div'); cell.className = 'cell'; cell.dataset.r = r; cell.dataset.c = c; cell.setAttribute('role','button'); cell.setAttribute('aria-label',`セル ${r+1},${c+1}`); cell.addEventListener('mouseenter', onCellMouseEnter); cell.addEventListener('mouseleave', onCellMouseLeave); cell.addEventListener('click', onCellClick); boardEl.appendChild(cell); } } renderBoard(); devHUD.graphics.canvasSize = `${boardEl.clientWidth}x${boardEl.clientHeight}`; }
    
    function renderBoard(){ 
      let objectCount = 0; const blockCounts = {}; COLORS.forEach(c => blockCounts[c] = 0);
      for(let r=0;r<ROWS;r++){ for(let c=0;c<COLS;c++){ const idx = r*COLS + c; const cell = boardEl.children[idx]; cell.innerHTML = ''; cell.classList.remove('hover-valid','hover-invalid'); if(board[r][c]){ objectCount++; blockCounts[board[r][c].color]++; const tile = document.createElement('div'); tile.className = 'tile'; tile.style.background = board[r][c].color; tile.style.transform = 'translateY(-6px)'; requestAnimationFrame(()=> tile.style.transform = 'translateY(0)'); cell.appendChild(tile); } } } 
      scoreBox.textContent = `Score: ${score}`; currentScoreEl.textContent = score; highBox.textContent = `High: ${best}`; bestScoreEl.textContent = best;
      if (devHUD.enabled) { devHUD.perf.drawCalls++; devHUD.graphics.spriteCount = objectCount; devHUD.data.objectCount = objectCount + pieces.length; devHUD.data.blockCounts = blockCounts; }
    }

    function cloneShape(shape){ return shape.map(s=>[s[0],s[1]]); }
    let nextId = 1; function genPiece(isBonus = false){ const shapePool = isBonus ? BONUS_SHAPES : SHAPES; const shape = cloneShape(shapePool[Math.floor(Math.random()*shapePool.length)]); const color = COLORS[Math.floor(Math.random()*COLORS.length)]; return { shape, color, id: nextId++ }; }
    
    function replenishPieces() { if (pieces.length === 0) { const newPieces = []; for(let i = 0; i < PIECE_COUNT; i++) { let piece; do { piece = getSmartPiece(); } while (newPieces.some(p => JSON.stringify(p.shape) === JSON.stringify(piece.shape))); newPieces.push(piece); } pieces = newPieces; turnCount++; if (devHUD.enabled) devHUD.progress.round = turnCount; } renderPieces(); }

    function renderPieces(){ 
      piecesContainer.innerHTML = ''; 
      pieces.forEach((p, i) => { const card = document.createElement('div'); card.className = 'piece-card'; if(i === selectedPieceIndex) card.classList.add('selected'); card.dataset.index = i; card.title = 'クリックで選択して盤面をクリックで配置'; card.addEventListener('click', ()=>{ if(isOver) return; selectedPieceIndex = (selectedPieceIndex === i) ? -1 : i; if (devHUD.enabled) { devHUD.data.selectedPiece = (selectedPieceIndex !== -1) ? `Piece #${i} (${pieces[i].shape.length} blocks)` : 'None'; } renderPieces(); }); const mini = document.createElement('div'); mini.className = 'piece-grid'; const PREVIEW_GRID_SIZE = 4; const shape = p.shape; const rows = shape.map(s=>s[0]), cols = shape.map(s=>s[1]); const minR = Math.min(...rows), minC = Math.min(...cols), maxR = Math.max(...rows), maxC = Math.max(...cols); const h = maxR - minR + 1, w = maxC - minC + 1; const offsetR = Math.max(0, Math.floor((PREVIEW_GRID_SIZE - h)/2)); const offsetC = Math.max(0, Math.floor((PREVIEW_GRID_SIZE - w)/2)); for(let rr=0; rr < PREVIEW_GRID_SIZE; rr++){ for(let cc=0; cc < PREVIEW_GRID_SIZE; cc++){ const mc = document.createElement('div'); mc.className = 'mini-cell'; const occupies = shape.some(s=>{ const sr = s[0]-minR + offsetR; const sc = s[1]-minC + offsetC; return sr===rr && sc===cc; }); if(occupies){ const t = document.createElement('div'); t.className = 'mini-cell tile'; t.style.background = p.color; mc.appendChild(t); } mini.appendChild(mc); } } card.appendChild(mini); piecesContainer.appendChild(card); }); 
      if (devHUD.enabled) devHUD.perf.drawCalls++;
    }

    function cellEl(r,c){ if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null; return boardEl.children[r*COLS + c]; }
    function canPlace(piece, baseR, baseC){ for(const off of piece.shape){ const rr = baseR + off[0], cc = baseC + off[1]; if(rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || board[rr][cc]) return false; } return true; }
    
    function placePiece(piece, baseR, baseC) { if (isSoundEnabled) { pushAudio.currentTime = 0; pushAudio.play().catch(()=>{}); } checkGoodPlacement(piece, baseR, baseC); for (const off of piece.shape) { board[baseR + off[0]][baseC + off[1]] = { color: piece.color, id: piece.id }; } pieces = pieces.filter(p => p.id !== piece.id); selectedPieceIndex = -1; hintLocation = null; if(devHUD.enabled) devHUD.data.selectedPiece = 'None'; renderBoard(); const afterClearActions = () => { replenishPieces(); renderBoard(); checkAllClear(); checkSessionEnd(); }; const clearedLinesCount = clearFullLines(afterClearActions); if (clearedLinesCount > 0) { comboCount++; comboTurnsLeft = 3; const gained = BASE_POINTS_PER_LINE * clearedLinesCount * clearedLinesCount * comboCount; setTimeout(() => showFeedbackPopup(`+${gained}`), 0); if(comboCount > 1) { setTimeout(() => showFeedbackPopup(`${comboCount} COMBO!`), 200); } let evaluationText = ''; if (clearedLinesCount === 2) evaluationText = 'Great!'; else if (clearedLinesCount === 3) evaluationText = 'Excellent!'; else if (clearedLinesCount >= 4) evaluationText = 'Amazing!'; if(evaluationText) { setTimeout(() => showFeedbackPopup(evaluationText), 400); } score = score + gained; } else { comboTurnsLeft--; if(comboTurnsLeft <= 0) comboCount = 0; } }

    function showFeedbackPopup(text){ const popup = document.createElement('div'); popup.textContent = text; popup.className = 'feedback-popup'; gamePanel.appendChild(popup); popup.addEventListener('animationend', () => popup.remove()); }
    function clearFullLines(onClearComplete) { const rowsToClear = [], colsToClear = []; for (let r = 0; r < ROWS; r++) { if (board[r].every(cell => cell)) rowsToClear.push(r); } for (let c = 0; c < COLS; c++) { if (board.every(row => row[c])) colsToClear.push(c); } const total = rowsToClear.length + colsToClear.length; if (total === 0) { onClearComplete(); return 0; } if (isSoundEnabled) { delAudio.currentTime = 0; delAudio.play().catch(()=>{}); } const clearMarks = new Set(); rowsToClear.forEach(r => { for (let c = 0; c < COLS; c++) clearMarks.add(`${r},${c}`); }); colsToClear.forEach(c => { for (let r = 0; r < ROWS; r++) clearMarks.add(`${r},${c}`); }); clearMarks.forEach(key => { const [r, c] = key.split(',').map(Number); const el = cellEl(r, c); if (el && el.firstChild) el.firstChild.classList.add('clearing'); }); setTimeout(() => { clearMarks.forEach(key => { const [r, c] = key.split(',').map(Number); board[r][c] = null; }); onClearComplete(); }, 500); return total; }
    function anyPlacementPossible(){ for(const p of pieces) for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(canPlace(p,r,c)) return true; return false; }
    function checkSessionEnd(){ 
        let end = false;
        if (currentMode === 'ultra' && gameTimer <= 0) { end = true; }
        if (currentMode === 'normal' && !anyPlacementPossible()) { end = true; }

        if(end) {
            isOver = true;
            stopTimer();
            showEndScreen();
            saveBest();
        }
        if(devHUD.enabled) devHUD.progress.isOver = isOver; 
    }
    function showEndScreen(){ 
        const overlay = document.createElement('div'); overlay.className = 'game-over'; overlay.id = 'gameOverOverlay'; 
        let title = 'トレーニング終了';
        if (currentMode === 'ultra') title = 'タイムアップ！';
        overlay.innerHTML = `<div class="go-card"><div style="font-size:20px;font-weight:800;margin-bottom:8px">${title}</div><div style="margin-bottom:8px">Score: <strong>${score}</strong></div><div style="display:flex;gap:8px;justify-content:center"><button class="btn" id="goRestart">もう一度</button><button class="btn ghost" id="goModeSelect">モード選択</button></div></div>`; 
        gamePanel.appendChild(overlay); 
        document.getElementById('goRestart').addEventListener('click', ()=>{ overlay.remove(); startNewSession(); }); 
        document.getElementById('goModeSelect').addEventListener('click', ()=>{ overlay.remove(); appContainer.classList.add('hidden'); showModeSelectModal(); }); 
    }
    function checkGoodPlacement(piece, r, c){ if(hintLocation && hintLocation.pieceId === piece.id && hintLocation.r === r && hintLocation.c === c){ setTimeout(() => showFeedbackPopup("👍 Perfect"), 600); } else { const moves = findGoodMoves(); if (moves.some(move => move.shape.length === piece.shape.length && JSON.stringify(move.shape) === JSON.stringify(piece.shape) && move.r === r && move.c === c)) { setTimeout(() => showFeedbackPopup("Great!"), 600); } } }
    function saveBest(){ 
        const key = currentMode === 'normal' ? 'blockblast_high_normal' : 'blockblast_high_ultra';
        best = Math.max(best, score); try { localStorage.setItem(key, String(best)); } catch(e){} renderBoard(); 
    }
    function loadBest(){ 
        const key = currentMode === 'normal' ? 'blockblast_high_normal' : 'blockblast_high_ultra';
        try{ best = Number(localStorage.getItem(key)) || 0; } catch(e){ best = 0; } 
    }
    function onCellMouseEnter(e){ if(isOver || selectedPieceIndex < 0  || selectedPieceIndex >= pieces.length) return; const r = Number(e.currentTarget.dataset.r), c = Number(e.currentTarget.dataset.c); const piece = pieces[selectedPieceIndex]; clearAllCellHover(); const valid = canPlace(piece, r, c); for(const off of piece.shape){ const rr = r + off[0], cc = c + off[1]; if(rr>=0&&rr<ROWS&&cc>=0&&cc<COLS){ const cel = cellEl(rr,cc); const tile = document.createElement('div'); tile.className = 'tile'; tile.style.opacity = '0.45'; tile.style.transform = 'scale(0.98)'; tile.style.background = piece.color; if (cel) { cel.classList.add(valid ? 'hover-valid' : 'hover-invalid'); cel.appendChild(tile); } } } }
    function onCellMouseLeave(e){ if(!isOver) clearAllCellHover(); }
    function clearAllCellHover(){ for(const cel of boardEl.children){ cel.classList.remove('hover-valid','hover-invalid'); for(let j = cel.children.length - 1; j >= 0; j--){ const child = cel.children[j]; if(child.style.opacity && Number(child.style.opacity) < 1){ cel.removeChild(child); } } } }
    function onCellClick(e){ if(isOver || selectedPieceIndex < 0 || selectedPieceIndex >= pieces.length) return; const r = Number(e.currentTarget.dataset.r), c = Number(e.currentTarget.dataset.c); const piece = pieces[selectedPieceIndex]; if(canPlace(piece, r, c)){ placePiece(piece, r, c); } else { e.currentTarget.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:220,iterations:1}); } }
    function provideHint(){ for(const [pi, p] of pieces.entries()){ for(let r=0;r<ROWS;r++){ for(let c=0;c<COLS;c++){ if(canPlace(p,r,c)){ p.shape.forEach(off => cellEl(r+off[0],c+off[1]).classList.add('hover-valid')); setTimeout(()=> clearAllCellHover(), 1000); selectedPieceIndex = pi; hintLocation = { pieceId: p.id, r, c }; renderPieces(); return; } } } } checkSessionEnd(); }
    
    function startTimer() {
        stopTimer();
        gameTimer = ULTRA_MODE_DURATION;
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            gameTimer--;
            updateTimerDisplay();
            if (gameTimer <= 0) {
                checkSessionEnd();
            }
        }, 1000);
    }
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; }
    function updateTimerDisplay() { const minutes = Math.floor(gameTimer / 60).toString().padStart(2, '0'); const seconds = (gameTimer % 60).toString().padStart(2, '0'); timerBox.textContent = `Time: ${minutes}:${seconds}`; }

    function startGame(mode) {
        currentMode = mode;
        devHUD.progress.mode = mode;
        
        modeSelectModal.classList.add('hidden');
        appContainer.classList.remove('hidden');
        appContainer.classList.add('fade-in');

        sokoharaRecordEl.textContent = GAME_CONFIG.SOKOHARA_RECORD;
        sokoharaRecordEl.classList.remove('hidden');
        sokoharaRecordEl.style.animation = 'fade-in-then-out 5s ease-out forwards';
        sokoharaRecordEl.addEventListener('animationend', () => {
            sokoharaRecordEl.classList.add('hidden');
            sokoharaRecordEl.style.animation = '';
        }, { once: true });

        if (currentMode === 'ultra') {
            modeBox.textContent = "3分ウルトラ";
            timerBox.classList.remove('hidden');
            startTimer();
        } else {
            modeBox.textContent = "通常モード";
            timerBox.classList.add('hidden');
        }
        
        startNewSession();
    }
    
    function startNewSession(){ 
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) board[r][c] = null; 
        pieces = []; selectedPieceIndex = -1; score = 0; isOver = false; hintLocation = null; comboCount = 0; comboTurnsLeft = 0; turnCount = 0; 
        loadBest();
        if (currentMode === 'ultra') { startTimer(); } else { stopTimer(); }
        replenishPieces(); renderBoard(); checkAllClear();
        const overlay = document.getElementById('gameOverOverlay'); if(overlay) overlay.remove(); 
        menuPanel.classList.remove('open');
        if (devHUD.enabled) { devHUD.progress.isOver = false; devHUD.progress.startTime = performance.now(); devHUD.progress.round = 1; }
    }
    
    // ★追加: モード選択に戻る関数
    function returnToModeSelect() {
        if (confirm('モード選択画面に戻りますか？\n現在のスコアは破棄されます。')) {
            stopTimer();
            isOver = true;
            appContainer.classList.add('hidden');
            menuPanel.classList.remove('open');
            showModeSelectModal();
        }
    }

    async function handleCheatCode() { const code = cheatInput.value.trim().toLowerCase(); if (code === 'towa.soko0406') { const newScoreStr = prompt('新しいスコアを入力してください:', score); const newScore = parseInt(newScoreStr, 10); if (!isNaN(newScore)) { score = newScore; renderBoard(); saveBest(); } else { alert('無効な数値です。'); } } else if (code === 'reset') { try { localStorage.clear(); alert('保存された全てのデータを削除しました。ページをリロードします。'); location.reload(); } catch (e) { alert('データの削除に失敗しました。'); } } else { alert('コードが違います。'); } cheatInput.value = ''; cheatCodeModal.classList.add('hidden'); }
    
    function showFakeTranslator() { fakeTranslator.classList.remove('hidden'); }
    function hideFakeTranslator() { fakeTranslator.classList.add('hidden'); }
    function simpleTranslate(text) { const map = {a:'b',b:'c','あ':'い','い':'う'}; return text.toLowerCase().split('').map(char => map[char] || char).join(''); }
    
    function findGoodMoves() { let moves = []; for (const shape of SHAPES) { for (let r = 0; r < ROWS; r++) { for (let c = 0; c < COLS; c++) { if (canPlace({shape}, r, c)) { let tempBoard = board.map(row => [...row]); if (wouldClearLine(tempBoard, {shape}, r, c)) { moves.push({ shape, r, c }); } } } } } return moves; }
    function getSmartPiece() { const goodMoves = findGoodMoves(); const difficulty = Math.random(); if (turnCount <= 7) { if (goodMoves.length > 0 && difficulty < 0.7) { const move = goodMoves[Math.floor(Math.random() * goodMoves.length)]; return { shape: cloneShape(move.shape), color: COLORS[Math.floor(Math.random() * COLORS.length)], id: nextId++ }; } } else if (score < LATE_GAME_SCORE) { if (goodMoves.length > 0 && difficulty < 0.5) { const move = goodMoves[Math.floor(Math.random() * goodMoves.length)]; return { shape: cloneShape(move.shape), color: COLORS[Math.floor(Math.random() * COLORS.length)], id: nextId++ }; } } else if (goodMoves.length > 0 && difficulty < 0.3) { const move = goodMoves[Math.floor(Math.random() * goodMoves.length)]; return { shape: cloneShape(move.shape), color: COLORS[Math.floor(Math.random() * COLORS.length)], id: nextId++ }; } let openSlots = 0; for(let r=0; r<ROWS; r++) for(let c=0; c<COLS; c++) if(!board[r][c]) openSlots++; if (openSlots < 20 && Math.random() < 0.2) { for (const shape of BONUS_SHAPES) { for (let r = 0; r < ROWS; r++) { for (let c = 0; c < COLS; c++) { if (canPlace({shape}, r, c)) { return { shape: cloneShape(shape), color: COLORS[Math.floor(Math.random()*COLORS.length)], id: nextId++ }; } } } } } return genPiece(turnCount <= 1 && !wasSkipPressed); }
    function wouldClearLine(board, piece, r, c) { for(const off of piece.shape) { board[r+off[0]][c+off[1]] = true; } let cleared = false; for (let i = 0; i < ROWS; i++) { if (board[i].every(cell => cell)) cleared = true; } for (let i = 0; i < COLS; i++) { if (board.every(row => row[i])) cleared = true; } for(const off of piece.shape) { board[r+off[0]][c+off[1]] = null; } return cleared; }
    function checkAllClear() { const isEmpty = board.every(row => row.every(cell => cell === null)); if (isEmpty && turnCount > 0) { showFeedbackPopup('ALL CLEAR!'); score += 1000; renderBoard(); } }
    
    function handleDevPassword() { const password = devPasswordInput.value.trim(); if (password === 'towa.soko0406') { devHUD.enabled = !devHUD.enabled; devHUD.debug.flags.devMode = devHUD.enabled; if (devHUD.enabled) { devHUD.elements.hud.classList.remove('hidden'); devHUD.elements.console.classList.remove('hidden'); alert('開発者モードが有効になりました。'); logToDevConsole('Developer mode enabled.'); } else { devHUD.elements.hud.classList.add('hidden'); devHUD.elements.console.classList.add('hidden'); alert('開発者モードが無効になりました。'); } } else if (password === 'reset') { if (confirm('本当に保存されているデータを全てリセットしますか？この操作は元に戻せません。')) { try { localStorage.clear(); alert('データをリセットしました。ページをリロードします。'); location.reload(); } catch (e) { alert('データのリセットに失敗しました。'); logToDevConsole('Failed to reset data.', 'error'); } } } else { alert('パスワードが違います。'); } devPasswordModal.classList.add('hidden'); devPasswordInput.value = ''; }

    window.showUpdateInfo = function() {
        const { title, sections, notices } = GAME_CONFIG.UPDATE_INFO;
        let sectionsHtml = sections.map(section => `<div class="sub-header">${section.header}</div><ul>${section.items.map(item => `<li>${item}</li>`).join('')}</ul>`).join('');
        let noticesHtml = notices.map(notice => `<div class="sub-header">${notice.header}</div><p class="note" style="line-height: 1.6;">${notice.text}</p>`).join('');
        noticeModal.innerHTML = `<div class="modal-content"><h2>${title}</h2>${sectionsHtml}${noticesHtml}<div class="modal-footer"><button class="btn" id="closeNoticeBtn">閉じる</button></div></div>`;
        noticeModal.classList.remove('hidden');
        document.getElementById('closeNoticeBtn').addEventListener('click', () => {
            noticeModal.classList.add('hidden');
            showRankingModal();
        });
    }

    window.showRankingModal = function (isFromMenu = false) {
        const rankings = GAME_CONFIG.RANKINGS;
        rankingModal.innerHTML = `<div class="modal-content"><h2>ランキング</h2><div class="ranking-tabs"><span class="ranking-tab active" data-tab="normal">通常</span><span class="ranking-tab" data-tab="ultra">3分ウルトラ</span><span class="ranking-tab" data-tab="developer">開発者</span></div><div class="ranking-list-container"></div><div class="modal-footer"><button class="btn" id="closeRankingBtn">閉じる</button></div></div>`;
        const listContainer = rankingModal.querySelector('.ranking-list-container');
        const tabs = rankingModal.querySelectorAll('.ranking-tab');
        function renderRanking(mode) {
            const data = rankings[mode];
            let tableHtml = '<table class="ranking-table"><thead><tr><th class="rank">順位</th><th>名前</th><th class="score">スコア</th></tr></thead><tbody>';
            tableHtml += data.map(item => `<tr><td class="rank">${item.rank}</td><td>${item.name}</td><td class="score">${!isNaN(item.score) ? Number(item.score).toLocaleString() : item.score}</td></tr>`).join('');
            tableHtml += '</tbody></table>';
            listContainer.innerHTML = tableHtml;
        }
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderRanking(tab.dataset.tab);
            });
        });
        rankingModal.querySelector('#closeRankingBtn').addEventListener('click', () => {
            rankingModal.classList.add('hidden');
            menuPanel.classList.remove('open');
            if (!isFromMenu) {
                showModeSelectModal();
            }
        });
        renderRanking('normal');
        rankingModal.classList.remove('hidden');
    }

    window.showModeSelectModal = function() {
        modeSelectModal.innerHTML = `
            <div class="modal-content">
                <div class="main-title">ブロックトレーニング</div>
                <h2>モード選択</h2>
                <div class="mode-select-container">
                    <button class="btn mode-select-btn" id="selectNormalMode">
                        <span class="mode-title">通常モード</span>
                        <span class="mode-desc">ピースが置けなくなるまでスコアを稼ぐエンドレスモード。<br><b>今までと一緒！</b></span>
                    </button>
                    <button class="btn mode-select-btn" id="selectUltraMode">
                        <span class="mode-title">3分ウルトラ</span>
                        <span class="mode-desc">3分間の制限時間で、どれだけ高いスコアを出せるか挑戦するモード。</span>
                    </button>
                </div>
            </div>`;
        modeSelectModal.classList.remove('hidden');
        document.getElementById('selectNormalMode').addEventListener('click', () => startGame('normal'));
        document.getElementById('selectUltraMode').addEventListener('click', () => startGame('ultra'));
    }

    function init(){
      createBoard();
      // ★修正点: ボタンのイベントリスナーを変更
      restartBtn.addEventListener('click', returnToModeSelect);
      hintBtn.addEventListener('click', provideHint);
      
      closeCheatBtn.addEventListener('click', () => cheatCodeModal.classList.add('hidden'));
      submitCheatBtn.addEventListener('click', handleCheatCode); cheatInput.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') handleCheatCode(); });
      
      hamburgerIcon.addEventListener('click', () => { menuPanel.classList.toggle('open'); });
      // ★修正点: メニューのボタンもモード選択に戻るように統一
      menuRestartBtn.addEventListener('click', returnToModeSelect);
      menuRankingBtn.addEventListener('click', () => showRankingModal(true));
      
      const savedSoundSetting = localStorage.getItem('blockblast_sound');
      if (savedSoundSetting !== null) { isSoundEnabled = savedSoundSetting === 'true'; soundToggle.checked = isSoundEnabled; }
      const playBGM = () => { if(isSoundEnabled) bgmAudio.play().catch(()=>{}); };
      document.body.addEventListener('click', playBGM, { once: true });
      soundToggle.addEventListener('change', (e) => { isSoundEnabled = e.target.checked; try { localStorage.setItem('blockblast_sound', isSoundEnabled); } catch(err) {} if (isSoundEnabled) { bgmAudio.play().catch(()=>{}); } else { bgmAudio.pause(); } });
      
      menuShareBtn.addEventListener('click', () => { const url = `${window.location.origin}${window.location.pathname}`; urlInput.value = url; qrcodeContainer.innerHTML = ''; QRCode.toCanvas(url, { width: 200, errorCorrectionLevel: 'H' }, function (err, canvas) { if (err) throw err; qrcodeContainer.appendChild(canvas); }); shareModal.classList.remove('hidden'); menuPanel.classList.remove('open'); });
      closeShareBtn.addEventListener('click', () => shareModal.classList.add('hidden'));
      copyUrlBtn.addEventListener('click', () => { urlInput.select(); navigator.clipboard.writeText(urlInput.value).then(() => { copyUrlBtn.textContent = 'コピー完了!'; setTimeout(() => { copyUrlBtn.textContent = 'コピー'; }, 2000); }); });
      
      menuDevModeBtn.addEventListener('click', () => { devPasswordModal.classList.remove('hidden'); devPasswordInput.focus(); menuPanel.classList.remove('open'); });
      closeDevPasswordBtn.addEventListener('click', () => devPasswordModal.classList.add('hidden'));
      submitDevPasswordBtn.addEventListener('click', handleDevPassword);
      devPasswordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleDevPassword(); });
      devHUD.elements.hud.addEventListener('click', (e) => { if (!devHUD.enabled || !e.target.dataset.action) return; const action = e.target.dataset.action; if (action === 'add-score') { score += 1000; } else if (action === 'sub-score') { score = Math.max(0, score - 1000); } else if (action === 'set-score') { const newScoreStr = prompt('新しいスコアを入力してください:', score); const newScore = parseInt(newScoreStr, 10); if (!isNaN(newScore) && newScore >= 0) { score = newScore; } else { alert('無効な数値です。'); } } logToDevConsole(`Score changed to ${score}`); renderBoard(); saveBest(); });
      
      const originalTitle = document.title; const favicon = document.getElementById('favicon'); const originalFavicon = favicon ? favicon.href : ''; const fakeTitle = '翻訳'; const fakeFavicon = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>';
      window.addEventListener('blur', () => { document.title = fakeTitle; if(favicon) favicon.href = fakeFavicon; }); window.addEventListener('focus', () => { document.title = originalTitle; if(favicon) favicon.href = originalFavicon; });
      translateBtn.addEventListener('click', () => { translatorOutput.value = simpleTranslate(translatorInput.value); });
      
      window.addEventListener('keydown', (ev)=>{
        if (ev.target.closest('.modal-overlay') || !fakeTranslator.classList.contains('hidden')) return;

        // ★修正点: ESCキーのハンドリングを追加
        if (ev.key === 'Escape' || ev.key === 'Esc') {
            ev.preventDefault();
            returnToModeSelect();
            return;
        }

        if (ev.key === 'Enter' && !ev.target.closest('.modal-overlay') && ev.target.tagName !== 'TEXTAREA') { ev.preventDefault(); if (fakeTranslator.classList.contains('hidden')) { showFakeTranslator(); } else { hideFakeTranslator(); } }
        if(ev.key === ' ') { ev.preventDefault(); cheatCodeModal.classList.remove('hidden'); cheatInput.focus(); }
        if(ev.key.toLowerCase() === 'r') startNewSession(); // ゲームオーバー後の「もう一度」と同じ挙動
        if(ev.key.toLowerCase() === 'h') provideHint();
        if(['1','2','3'].includes(ev.key)){ const idx = Number(ev.key) - 1; if(idx < pieces.length){ selectedPieceIndex = (selectedPieceIndex === idx) ? -1 : idx; renderPieces(); } }
      });
    }

    init();
}