document.addEventListener('DOMContentLoaded', () => {

    const loader = document.getElementById('loader');
    const skipBtn = document.getElementById('skipBtn');
    let gameStarted = false;

    function startAppSequence() {
        if (gameStarted) return;
        gameStarted = true;
        if(loader) {
            loader.classList.add('fade-out');
            loader.addEventListener('animationend', () => {
                loader.remove();
                document.getElementById('app-container').classList.remove('hidden');
                gameApp.init();
            }, { once: true });
        }
    }
    skipBtn.addEventListener('click', () => { clearTimeout(startTimer); startAppSequence(); });
    const startTimer = setTimeout(startAppSequence, 15000);

    const gameApp = {
        VIAL_CAPACITY: 4,
        MAX_LEVEL: 100,
        COLORS: ['#d90429', '#f77f00', '#f1c453', '#5fad56', '#00b4d8', '#2b2d42', '#e05297', '#6c584c', '#d62828', '#fcbf49', '#90e0ef', '#541f5c', '#8ac926', '#f94144', '#f8961e', '#90be6d'],

        vials: [],
        currentLevel: 1,
        clearedLevel: 0,
        selectedVialInfo: null,
        focusedVialIndex: -1,
        isAnimating: false,
        inactivityTimer: null,
        controlMode: null,
        lastPlayed: null,
        needsTutorial: false,

        dom: {
            appContainer: document.getElementById('app-container'),
            modeSelectionScreen: document.getElementById('mode-selection-screen'),
            levelSelectionScreen: document.getElementById('level-selection-screen'),
            gameScreen: document.getElementById('game-screen'),
            mouseModeBtn: document.getElementById('mouse-mode-btn'),
            keyboardModeBtn: document.getElementById('keyboard-mode-btn'),
            levelGrid: document.getElementById('level-grid'),
            gameBoard: document.getElementById('game-board'),
            animationLayer: document.getElementById('animation-layer'),
            currentLevelText: document.getElementById('current-level-text'),
            backToLevelSelectBtn: document.getElementById('back-to-level-select-btn'),
            restartLevelBtn: document.getElementById('restart-level-btn'),
            resetProgressBtn: document.getElementById('reset-progress-btn'),
            levelCompleteModal: document.getElementById('level-complete-modal'),
            completedLevelText: document.getElementById('completed-level-text'),
            nextLevelBtn: document.getElementById('next-level-btn'),
            backToMenuBtn: document.getElementById('back-to-menu-btn'),
            gameCompleteModal: document.getElementById('game-complete-modal'),
            backToMenuFinalBtn: document.getElementById('back-to-menu-final-btn'),
            tutorialModal: document.getElementById('tutorial-modal'),
            closeTutorialBtn: document.getElementById('close-tutorial-btn'),
        },

        init() {
            this.loadProgress();
            this.checkTutorialNeeded();
            this.setupEventListeners();
            this.resetInactivityTimer();
        },

        setupEventListeners() {
            this.dom.mouseModeBtn.addEventListener('click', () => this.setControlMode('mouse'));
            this.dom.keyboardModeBtn.addEventListener('click', () => this.setControlMode('keyboard'));
            this.dom.backToLevelSelectBtn.addEventListener('click', () => this.showScreen('level-selection-screen'));
            this.dom.restartLevelBtn.addEventListener('click', () => this.startLevel(this.currentLevel));
            this.dom.resetProgressBtn.addEventListener('click', () => {
                if (confirm('本当にすべての進捗をリセットしますか？')) {
                    this.clearedLevel = 0;
                    localStorage.removeItem('colorSort_lastPlayed');
                    this.saveProgress();
                    this.populateLevelGrid();
                }
            });
            this.dom.nextLevelBtn.addEventListener('click', () => this.goToNextLevel());
            this.dom.backToMenuBtn.addEventListener('click', () => this.showScreen('level-selection-screen'));
            this.dom.backToMenuFinalBtn.addEventListener('click', () => this.showScreen('level-selection-screen'));
            this.dom.closeTutorialBtn.addEventListener('click', () => {
                this.needsTutorial = false;
                this.dom.tutorialModal.classList.add('hidden');
                this.showScreen('level-selection-screen');
                this.populateLevelGrid();
            });
            window.addEventListener('keydown', this.handleKeyDown.bind(this));
            ['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(event => {
                window.addEventListener(event, () => this.resetInactivityTimer());
            });
        },
        
        setControlMode(mode) {
            this.controlMode = mode;
            if (this.needsTutorial) {
                this.showTutorial(mode);
            } else {
                this.showScreen('level-selection-screen');
                this.populateLevelGrid();
            }
        },

        showTutorial(mode) {
            this.dom.tutorialModal.querySelectorAll('.tutorial-content').forEach(el => el.classList.add('hidden'));
            if (mode === 'mouse') {
                document.getElementById('tutorial-mouse').classList.remove('hidden');
            } else {
                document.getElementById('tutorial-keyboard').classList.remove('hidden');
            }
            this.dom.tutorialModal.classList.remove('hidden');
        },

        showScreen(screenId) {
            this.dom.levelCompleteModal.classList.add('hidden');
            this.dom.gameCompleteModal.classList.add('hidden');
            this.dom.appContainer.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            document.getElementById(screenId).classList.add('active');
        },

        populateLevelGrid() {
            this.dom.levelGrid.innerHTML = '';
            for (let i = 1; i <= this.MAX_LEVEL; i++) {
                const btn = document.createElement('button');
                btn.className = 'btn level-btn';
                btn.textContent = i;
                if (i <= this.clearedLevel + 1) {
                    if (i <= this.clearedLevel) btn.classList.add('cleared');
                    btn.addEventListener('click', () => this.startLevel(i));
                } else {
                    btn.classList.add('locked');
                    btn.disabled = true;
                }
                this.dom.levelGrid.appendChild(btn);
            }
        },

        startLevel(level) {
            if (this.isAnimating) return;
            this.updateLastPlayed();
            this.currentLevel = level;
            this.dom.currentLevelText.textContent = level;
            this.selectedVialInfo = null;
            this.focusedVialIndex = 0;
            this.setupLevel();
            this.showScreen('game-screen');
        },

        getLevelConfig(level) {
            const vialCount = Math.min(16, 5 + Math.floor((level - 1) / 5));
            const colorCount = Math.min(this.COLORS.length, 3 + Math.floor((level - 1) / 4));
            const emptyVials = (level < 20) ? 2 : 1;
            const shuffleMoves = 60 + level * 8;
            return { vials: vialCount, colors: colorCount, empty: Math.max(1, vialCount - colorCount), shuffle: shuffleMoves };
        },

        setupLevel() {
            const config = this.getLevelConfig(this.currentLevel);
            const gameColors = this.COLORS.slice(0, config.colors);
            let solvedState = gameColors.map(color => Array(this.VIAL_CAPACITY).fill(color));
            for (let i = 0; i < config.empty; i++) {
                solvedState.push([]);
            }
            let tempVials = JSON.parse(JSON.stringify(solvedState));
            for (let i = 0; i < config.shuffle; i++) {
                const fromIndices = tempVials.map((v, idx) => v.length > 0 ? idx : -1).filter(idx => idx !== -1);
                const toIndices = tempVials.map((v, idx) => v.length < this.VIAL_CAPACITY ? idx : -1).filter(idx => idx !== -1);
                if (fromIndices.length < 2) continue;
                let from = fromIndices[Math.floor(Math.random() * fromIndices.length)];
                let to = toIndices[Math.floor(Math.random() * toIndices.length)];
                if (from === to) continue;
                tempVials[to].push(tempVials[from].pop());
            }
            this.vials = tempVials;
            this.render();
        },
        
        render() {
            this.dom.gameBoard.innerHTML = '';
            if (this.vials.length === 0) return;
            this.vials.forEach((vial, index) => {
                const vialEl = document.createElement('div');
                vialEl.className = 'vial';
                vial.forEach(color => {
                    const blockEl = document.createElement('div');
                    blockEl.className = 'block';
                    blockEl.style.backgroundColor = color;
                    vialEl.appendChild(blockEl);
                });
                if (this.selectedVialInfo && index === this.selectedVialInfo.index) vialEl.classList.add('selected');
                if (this.controlMode === 'keyboard' && this.focusedVialIndex === index) vialEl.classList.add('focused');
                if (this.isVialComplete(vial)) vialEl.classList.add('completed');
                vialEl.addEventListener('click', () => this.handleVialClick(index));
                this.dom.gameBoard.appendChild(vialEl);
            });
        },

        handleVialClick(index) {
            if (this.isAnimating) return;
            if (this.selectedVialInfo === null) {
                const clickedVial = this.vials[index];
                if (clickedVial.length > 0 && !this.isVialComplete(clickedVial)) {
                    this.selectedVialInfo = { index };
                }
            } else {
                if (index === this.selectedVialInfo.index) {
                    this.selectedVialInfo = null;
                } else {
                    this.move(this.selectedVialInfo.index, index);
                    this.selectedVialInfo = null;
                }
            }
            this.render();
        },

        async move(fromIndex, toIndex) {
            const fromVial = this.vials[fromIndex];
            const toVial = this.vials[toIndex];
            if (fromVial.length === 0) return;

            const topColor = fromVial[fromVial.length - 1];
            let moveCount = 0;
            for (let i = fromVial.length - 1; i >= 0; i--) {
                if (fromVial[i] === topColor) moveCount++; else break;
            }

            // ★★★ ルール変更箇所 ★★★
            // 色のチェック (toVial.length === 0 || toVial[toVial.length - 1] === topColor) を削除。
            // これにより、空きスペースさえあればどんな色の上にも移動可能になる。
            if (toVial.length + moveCount <= this.VIAL_CAPACITY) {
                this.isAnimating = true;
                const blocksToMove = fromVial.slice(fromVial.length - moveCount);
                await this.animateMove(fromIndex, toIndex, blocksToMove);
                this.vials[fromIndex] = fromVial.slice(0, fromVial.length - moveCount);
                this.vials[toIndex].push(...blocksToMove);
                this.isAnimating = false;
                this.render();
                this.checkWinCondition();
            }
        },

        isVialComplete(vial) {
            return vial.length === this.VIAL_CAPACITY && vial.every(c => c === vial[0]);
        },
        
        goToNextLevel() {
            this.dom.levelCompleteModal.classList.add('hidden');
            this.startLevel(this.currentLevel + 1);
        },

        checkWinCondition() {
            const isWin = this.vials.every(vial => vial.length === 0 || this.isVialComplete(vial));
            if (isWin) {
                if (this.currentLevel > this.clearedLevel) {
                    this.clearedLevel = this.currentLevel;
                    this.saveProgress();
                }
                setTimeout(() => {
                    if (this.currentLevel === this.MAX_LEVEL) {
                        this.dom.gameCompleteModal.classList.remove('hidden');
                    } else {
                        this.dom.completedLevelText.textContent = this.currentLevel;
                        this.dom.levelCompleteModal.classList.remove('hidden');
                    }
                }, 400);
            }
        },

        animateMove(fromIndex, toIndex, blocks) {
            return new Promise(resolve => {
                const fromVialEl = this.dom.gameBoard.children[fromIndex];
                const toVialEl = this.dom.gameBoard.children[toIndex];
                const fromRect = fromVialEl.getBoundingClientRect();
                const toRect = toVialEl.getBoundingClientRect();
                const blockHeight = fromVialEl.querySelector('.block')?.clientHeight || 50;
                blocks.forEach((color, i) => {
                    const blockEl = document.createElement('div');
                    blockEl.className = 'moving-block';
                    blockEl.style.backgroundColor = color;
                    const startY = fromRect.bottom - (this.vials[fromIndex].length - i) * (blockHeight + 4) - 20;
                    const startX = fromRect.left + (fromRect.width - 44) / 2;
                    const endY = toRect.bottom - (this.vials[toIndex].length + i + 1) * (blockHeight + 4) - 20;
                    const endX = toRect.left + (toRect.width - 44) / 2;
                    blockEl.style.left = `${startX}px`;
                    blockEl.style.top = `${startY}px`;
                    this.dom.animationLayer.appendChild(blockEl);
                    const duration = 500 + i * 50;
                    blockEl.animate([
                        { transform: `translate(0, 0)` },
                        { transform: `translate(${endX - startX}px, ${-100}px)` },
                        { transform: `translate(${endX - startX}px, ${endY - startY}px)` }
                    ], { duration: duration, easing: 'cubic-bezier(0.5, 0, 0.7, 1)', delay: i * 80 }).onfinish = () => {
                        blockEl.remove();
                        if (i === blocks.length - 1) resolve();
                    };
                });
            });
        },

        handleKeyDown(e) {
            if (e.key === ' ' || e.key === 'Enter') {
                if (!this.dom.levelCompleteModal.classList.contains('hidden')) { e.preventDefault(); this.goToNextLevel(); return; }
                if (!this.dom.gameCompleteModal.classList.contains('hidden')) { e.preventDefault(); this.showScreen('level-selection-screen'); return; }
            }
            if (this.controlMode === 'keyboard' && this.dom.gameScreen.classList.contains('active') && !this.isAnimating) {
                const vialCount = this.vials.length;
                if (vialCount === 0) return;
                if (e.key === 'ArrowRight') { this.focusedVialIndex = (this.focusedVialIndex + 1) % vialCount; }
                else if (e.key === 'ArrowLeft') { this.focusedVialIndex = (this.focusedVialIndex - 1 + vialCount) % vialCount; }
                else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (this.focusedVialIndex !== -1) this.handleVialClick(this.focusedVialIndex); }
                this.render();
            }
        },

        checkTutorialNeeded() {
            if (!this.lastPlayed) { this.needsTutorial = true; return; }
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - this.lastPlayed > oneWeek) { this.needsTutorial = true; }
        },

        updateLastPlayed() {
            const now = Date.now();
            this.lastPlayed = now;
            localStorage.setItem('colorSort_lastPlayed', now);
        },

        saveProgress() {
            localStorage.setItem('colorSort_clearedLevel', this.clearedLevel);
        },

        loadProgress() {
            const savedLevel = localStorage.getItem('colorSort_clearedLevel');
            this.clearedLevel = savedLevel ? parseInt(savedLevel, 10) : 0;
            const savedLastPlayed = localStorage.getItem('colorSort_lastPlayed');
            this.lastPlayed = savedLastPlayed ? parseInt(savedLastPlayed, 10) : null;
        },

        resetInactivityTimer() {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = setTimeout(() => {
                const mainHomeButton = document.querySelector('.btn-main-home');
                if (mainHomeButton) window.location.href = mainHomeButton.href;
            }, 3600000); // 1時間
        }
    };
});