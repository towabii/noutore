const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 設定 ---
const TILE_SIZE = 64;
const SPEED = 9.0; 
const ROTATION_SPEED = 0.13;
const GROUND_HEIGHT = 2; 

// 物理演算 (2.5ブロック調整版)
const GRAVITY_CUBE = 0.95; 
const JUMP_CUBE = -18.5;
const JUMP_ORB = -16.0;
const JUMP_PAD = -23.0;

const GRAVITY_SHIP = 0.4;
const SHIP_THRUST = -0.8; 
const SHIP_MAX_UP = -9.0;
const SHIP_MAX_DOWN = 10.0;

// --- Audio ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

const SOUNDS = {
    jump: { freq: 400, type: 'square', decay: 0.1 },
    die: { freq: 150, type: 'sawtooth', decay: 0.5 },
    pad: { freq: 600, type: 'sine', decay: 0.2 },
    orb: { freq: 700, type: 'sine', decay: 0.1 },
    portal: { freq: 200, type: 'square', decay: 0.3 },
    win: { freq: 880, type: 'triangle', decay: 1.0 }
};

function playSound(name) {
    if (!audioCtx) return;
    const s = SOUNDS[name];
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = s.type;
    osc.frequency.setValueAtTime(s.freq, audioCtx.currentTime);
    
    if (name === 'jump') osc.frequency.exponentialRampToValueAtTime(s.freq + 200, audioCtx.currentTime + 0.1);
    if (name === 'die') osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
    if (name === 'portal') osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.3);
    if (name === 'pad') osc.frequency.exponentialRampToValueAtTime(s.freq + 300, audioCtx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + s.decay);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + s.decay);
}

let bgmInterval;
function startBGM() {
    if (bgmInterval) clearInterval(bgmInterval);
    if (!audioCtx) return;
    let beat = 0;
    bgmInterval = setInterval(() => {
        if(gameState !== 'PLAYING') return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        const baseFreq = player.mode === 'SHIP' ? 55 : 45;
        const freq = (beat % 4 === 0) ? baseFreq * 2 : (beat % 8 === 6 ? baseFreq * 1.5 : baseFreq);
        
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
        beat++;
    }, 150); 
}

// --- 変数 ---
let currentLevel = 1;
let gameState = 'SPLASH'; // 最初はスプラッシュ
let animationFrameId = null;

let player = { 
    x: 0, y: 0, w: TILE_SIZE-14, h: TILE_SIZE-14, 
    dy: 0, angle: 0, 
    isGrounded: false, dead: false, 
    mode: 'CUBE', 
    trail: [] 
};
let input = { holding: false };
let camera = { x: 0 };
let blocks = [];
let triggers = [];
let particles = [];
let mapWidth = 0;
let bgHue = 240;
let floorY = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    floorY = canvas.height - (TILE_SIZE * GROUND_HEIGHT);
}
window.addEventListener('resize', resize);
resize();

function getHighScore(lvl) { return localStorage.getItem('gd_hs_'+lvl) || 0; }
function saveHighScore(lvl, sc) { if(sc > getHighScore(lvl)) localStorage.setItem('gd_hs_'+lvl, sc); }

// --- 起動処理 ---
window.onload = function() {
    // 2秒後にメニューを表示
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        document.getElementById('menu-screen').style.display = 'flex';
        gameState = 'MENU';
        // オーディオコンテキスト準備（ユーザー操作待ち）
        resize();
        draw(); // 背景描画用
    }, 2000);
};

// --- ゲーム開始 ---
function initGame(lvl) {
    if (!audioCtx) audioCtx = new AudioContext();
    else if (audioCtx.state === 'suspended') audioCtx.resume();

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    currentLevel = lvl;
    gameState = 'PLAYING';
    
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('ui-layer').style.display = 'block';
    document.getElementById('message').style.display = 'none';
    document.getElementById('level-indicator').innerText = "レベル " + lvl;

    resetLevel();
    startBGM();
    loop();
}

function resetLevel() {
    blocks = [];
    triggers = []; 
    const layout = getLevelMap(currentLevel);
    if(!layout || layout.length === 0) return;

    const rows = layout.length;
    const cols = layout[0].length;
    mapWidth = cols * TILE_SIZE;
    const bottomRowY = floorY - TILE_SIZE;

    for (let r = 0; r < rows; r++) {
        const rowStr = layout[r];
        const by = bottomRowY - ((rows - 1 - r) * TILE_SIZE);

        for (let c = 0; c < rowStr.length; c++) {
            const ch = rowStr[c];
            const bx = c * TILE_SIZE;
            
            if(ch === ' ') continue;

            let b = {x:bx, y:by, w:TILE_SIZE, h:TILE_SIZE, type:''};

            if(ch === '#') { b.type = 'BLOCK'; blocks.push(b); }
            else if(ch === '^') { 
                b.type = 'SPIKE'; 
                b.w = TILE_SIZE-32; b.h = TILE_SIZE-16; 
                b.x += 16; b.y += 16; 
                b.dx = bx; b.dy = by; 
                blocks.push(b);
            }
            else if(ch === 'J') { b.type = 'PAD'; b.h = 20; b.y = by + TILE_SIZE - 20; b.x += 10; b.w -= 20; triggers.push(b); }
            else if(ch === 'O') { b.type = 'ORB'; b.w = 40; b.h = 40; b.x += 12; b.y += 12; triggers.push(b); }
            else if(ch === 'S') { b.type = 'PORTAL_SHIP'; b.w = 50; b.h = TILE_SIZE*2; triggers.push(b); }
            else if(ch === 'C') { b.type = 'PORTAL_CUBE'; b.w = 50; b.h = TILE_SIZE*2; triggers.push(b); }
            else if(ch === 'G') { b.type = 'GOAL'; b.y = floorY - TILE_SIZE*20; b.h = TILE_SIZE*20; triggers.push(b); }
        }
    }

    player.x = 0;
    player.y = floorY - TILE_SIZE - 10;
    player.dy = 0;
    player.angle = 0;
    player.dead = false;
    player.mode = 'CUBE';
    player.trail = [];
    input.holding = false;
    camera.x = 0;
    particles = [];
    bgHue = 240; 
}

// --- ループ ---
function loop() {
    update();
    draw();
    if(gameState !== 'MENU' && gameState !== 'SPLASH') {
        animationFrameId = requestAnimationFrame(loop);
    }
}

// --- 更新 ---
function update() {
    if (gameState !== 'PLAYING') return;
    if (player.dead) return;

    bgHue = (bgHue + 0.1);
    if(bgHue > 260) bgHue = 220; 

    if (Date.now() % 3 === 0) {
        player.trail.push({x: player.x, y: player.y, angle: player.angle, alpha: 0.6, mode: player.mode});
        if(player.trail.length > 10) player.trail.shift();
    }

    player.x += SPEED;

    if (player.mode === 'CUBE') {
        player.dy += GRAVITY_CUBE;
        player.y += player.dy;
        
        if (!player.isGrounded) player.angle += ROTATION_SPEED;
        else {
            const target = Math.round(player.angle / (Math.PI/2)) * (Math.PI/2);
            player.angle += (target - player.angle) * 0.3;
        }
    } else if (player.mode === 'SHIP') {
        if (input.holding) player.dy += SHIP_THRUST; 
        player.dy += GRAVITY_SHIP;
        if(player.dy < SHIP_MAX_UP) player.dy = SHIP_MAX_UP;
        if(player.dy > SHIP_MAX_DOWN) player.dy = SHIP_MAX_DOWN;
        player.y += player.dy;
        
        let targetAngle = player.dy * 0.05;
        player.angle += (targetAngle - player.angle) * 0.1;
    }

    player.isGrounded = false;
    if (player.y + player.h >= floorY) {
        player.y = floorY - player.h;
        player.dy = 0;
        player.isGrounded = true;
        if(player.mode === 'CUBE') player.angle = Math.round(player.angle / (Math.PI/2)) * (Math.PI/2);
    }
    
    if (player.y < -500 && player.mode === 'SHIP') player.dy = 1;

    checkTriggers();
    checkSolids();

    camera.x = player.x - 300;

    const pct = Math.min(100, Math.floor((player.x / mapWidth) * 100));
    document.getElementById('current-progress').innerText = `${pct}%`;
    document.getElementById('high-score').innerText = `自己ベスト: ${getHighScore(currentLevel)}%`;
}

function checkTriggers() {
    const px = player.x + 10; 
    const py = player.y + 5;
    const pw = player.w - 20;
    const ph = player.h - 10;

    for (let t of triggers) {
        if (t.x > player.x + canvas.width || t.x + t.w < player.x - 100) continue;

        if (px + pw > t.x && px < t.x + t.w && py + ph > t.y && py < t.y + t.h) {
            if (t.type === 'PAD') {
                playSound('pad');
                player.dy = JUMP_PAD;
                player.isGrounded = false;
                createParticles(t.x + t.w/2, t.y, 10, '#ffff00');
                return;
            }
            else if (t.type === 'PORTAL_SHIP') {
                if(player.mode !== 'SHIP') {
                    player.mode = 'SHIP'; playSound('portal'); createParticles(player.x, player.y, 20, '#00ff00');
                }
            }
            else if (t.type === 'PORTAL_CUBE') {
                if(player.mode !== 'CUBE') {
                    player.mode = 'CUBE'; player.angle = 0; playSound('portal'); createParticles(player.x, player.y, 20, '#ff8800');
                }
            }
            else if (t.type === 'GOAL') {
                levelClear();
            }
        }
    }
}

function checkSolids() {
    const marginX = 24; 
    const px = player.x + marginX;
    const pw = player.w - (marginX * 2);
    const py = player.y;
    const ph = player.h;

    for (let b of blocks) {
        if (b.x > player.x + canvas.width || b.x + b.w < player.x - 100) continue;

        if (px + pw > b.x && px < b.x + b.w && py + ph > b.y && py < b.y + b.h) {
            
            if (b.type === 'SPIKE') { die(); return; }

            if (b.type === 'BLOCK') {
                const blockTop = b.y;
                const penetrationY = (player.y + player.h) - blockTop;
                
                // 吸い付き判定
                if (penetrationY < 40 && player.dy > -8) {
                    player.y = blockTop - player.h;
                    player.dy = 0;
                    player.isGrounded = true;
                    if(player.mode === 'SHIP') player.angle = 0;
                } else {
                    const headDist = (player.y) - (b.y + b.h);
                    if (Math.abs(headDist) < 20 && player.dy < 0) {
                        player.y = b.y + b.h;
                        player.dy = 0;
                    } else {
                        die();
                        return;
                    }
                }
            }
        }
    }
}

function handleInputStart() {
    if (gameState === 'MENU' || gameState === 'SPLASH') return;
    if (gameState === 'GAMEOVER' || gameState === 'CLEARED') {
        initGame(currentLevel);
        return;
    }
    input.holding = true;

    if (player.mode === 'CUBE') {
        let hitOrb = false;
        const cx = player.x + player.w/2;
        const cy = player.y + player.h/2;
        
        for(let t of triggers) {
            if(t.type === 'ORB' && cx > t.x && cx < t.x + t.w && cy > t.y && cy < t.y + t.h) {
                playSound('orb');
                player.dy = JUMP_ORB;
                player.isGrounded = false;
                createParticles(t.x+t.w/2, t.y+t.h/2, 10, '#00ffff');
                hitOrb = true;
                break;
            }
        }
        if (!hitOrb && player.isGrounded) {
            playSound('jump');
            player.dy = JUMP_CUBE;
            player.isGrounded = false;
            createParticles(player.x + player.w/2, player.y + player.h, 5, '#fff');
        }
    }
}

function handleInputEnd() { input.holding = false; }

window.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'ArrowUp') handleInputStart();
    if (e.code === 'Escape') {
        if (gameState === 'PLAYING') {
            gameState = 'MENU';
            document.getElementById('menu-screen').style.display = 'flex';
            document.getElementById('ui-layer').style.display = 'none';
            if(animationFrameId) cancelAnimationFrame(animationFrameId);
            resize();
            draw();
        }
    }
});
window.addEventListener('keyup', e => { if (e.code === 'Space' || e.code === 'ArrowUp') handleInputEnd(); });
window.addEventListener('mousedown', handleInputStart);
window.addEventListener('mouseup', handleInputEnd);
window.addEventListener('touchstart', (e) => { e.preventDefault(); handleInputStart(); }, {passive:false});
window.addEventListener('touchend', (e) => { e.preventDefault(); handleInputEnd(); });

function die() {
    if (player.dead) return;
    player.dead = true;
    playSound('die');
    gameState = 'GAMEOVER';
    saveHighScore(currentLevel, Math.floor((player.x/mapWidth)*100));
    createParticles(player.x, player.y, 50, '#ffff00');
    document.getElementById('message').innerHTML = "クラッシュ！<br><span style='font-size:20px'>スペースキーでリトライ</span>";
    document.getElementById('message').style.display = 'block';
}

function levelClear() {
    player.dead = true;
    gameState = 'CLEARED';
    playSound('win');
    saveHighScore(currentLevel, 100);
    document.getElementById('message').innerHTML = "<span style='color:#0f0'>レベルクリア！</span><br><span style='font-size:20px'>スペースキーで次へ</span>";
    document.getElementById('message').style.display = 'block';
}

function createParticles(x, y, count, color) {
    for(let i=0; i<count; i++) {
        particles.push({x:x, y:y, vx:(Math.random()-0.5)*15, vy:(Math.random()-0.5)*15, life:1.0, color:color});
    }
}

function draw() {
    ctx.fillStyle = `hsl(${bgHue}, 50%, 15%)`; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camera.x * 0.2, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2;
    const gx = Math.floor(camera.x * 0.2 / 100) * 100;
    for(let x=gx; x<gx+canvas.width+200; x+=100) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    ctx.restore();

    ctx.save();
    ctx.translate(-camera.x, 0);

    // Floor
    ctx.fillStyle = '#000';
    ctx.fillRect(camera.x, floorY, canvas.width, canvas.height-floorY);
    ctx.strokeStyle = `hsl(${bgHue}, 100%, 50%)`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(camera.x, floorY); ctx.lineTo(camera.x+canvas.width, floorY); ctx.stroke();

    for(let b of blocks) {
        if(b.x+b.w < camera.x || b.x > camera.x+canvas.width) continue;
        
        if(b.type === 'BLOCK') {
            ctx.fillStyle = '#000'; ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeStyle = '#0ff'; ctx.lineWidth=2; ctx.strokeRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = 'rgba(0,255,255,0.1)'; ctx.fillRect(b.x+5, b.y+5, b.w-10, b.h-10);
        }
        else if(b.type === 'SPIKE') {
            ctx.fillStyle = '#000'; 
            ctx.beginPath(); ctx.moveTo(b.dx, b.dy+TILE_SIZE); ctx.lineTo(b.dx+TILE_SIZE/2, b.dy); ctx.lineTo(b.dx+TILE_SIZE, b.dy+TILE_SIZE); ctx.fill();
            ctx.strokeStyle = '#f00'; ctx.lineWidth=2; ctx.stroke();
        }
    }
    
    for(let t of triggers) {
        if(t.x+t.w < camera.x || t.x > camera.x+canvas.width) continue;
        
        if(t.type === 'PAD') { ctx.fillStyle = '#ff0'; ctx.beginPath(); ctx.arc(t.x+t.w/2, t.y+t.h, t.w/2, Math.PI, 0); ctx.fill(); }
        else if(t.type === 'ORB') { ctx.fillStyle = 'rgba(255,255,0,0.3)'; ctx.beginPath(); ctx.arc(t.x+t.w/2, t.y+t.h/2, t.w/2, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = '#ff0'; ctx.lineWidth=3; ctx.stroke(); }
        else if(t.type === 'PORTAL_SHIP') { ctx.fillStyle = 'rgba(0,255,0,0.5)'; ctx.fillRect(t.x, t.y, t.w, t.h); ctx.strokeStyle = '#0f0'; ctx.strokeRect(t.x, t.y, t.w, t.h); }
        else if(t.type === 'PORTAL_CUBE') { ctx.fillStyle = 'rgba(255,128,0,0.5)'; ctx.fillRect(t.x, t.y, t.w, t.h); ctx.strokeStyle = '#f80'; ctx.strokeRect(t.x, t.y, t.w, t.h); }
        else if(t.type === 'GOAL') { ctx.fillStyle = 'rgba(255,255,0,0.2)'; ctx.fillRect(t.x, t.y, t.w, t.h); }
    }

    if(!player.dead) {
        for(let t of player.trail) {
            ctx.save(); ctx.translate(t.x+player.w/2, t.y+player.h/2); ctx.rotate(t.angle);
            ctx.fillStyle = `rgba(255,255,0,${t.alpha*0.3})`;
            if(t.mode==='SHIP') { ctx.beginPath(); ctx.moveTo(20,0); ctx.lineTo(-10,10); ctx.lineTo(-10,-10); ctx.fill(); } 
            else { ctx.fillRect(-player.w/2, -player.h/2, player.w, player.h); }
            ctx.restore(); t.alpha -= 0.05;
        }
        player.trail = player.trail.filter(t => t.alpha > 0);

        ctx.save(); ctx.translate(player.x+player.w/2, player.y+player.h/2); ctx.rotate(player.angle);
        if(player.mode === 'SHIP') {
            ctx.shadowBlur = 10; ctx.shadowColor = '#ff0'; ctx.fillStyle = '#ff4444';
            ctx.beginPath(); ctx.moveTo(player.w/2 + 10, 0); ctx.lineTo(-player.w/2, player.h/2); ctx.lineTo(-player.w/2 + 5, 0); ctx.lineTo(-player.w/2, -player.h/2); ctx.fill();
            ctx.lineWidth=2; ctx.strokeStyle='#fff'; ctx.stroke();
            ctx.fillStyle='#0ff'; ctx.beginPath(); ctx.arc(0,0, 8, 0, Math.PI*2); ctx.fill();
        } else {
            ctx.shadowBlur = 15; ctx.shadowColor = '#ff0';
            ctx.fillStyle = '#ff0'; ctx.fillRect(-player.w/2, -player.h/2, player.w, player.h);
            ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.strokeRect(-player.w/2, -player.h/2, player.w, player.h);
            ctx.fillStyle = '#000'; ctx.fillRect(8, -10, 10, 10); ctx.fillRect(8, 6, 10, 10);
            ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(22,-5); ctx.lineTo(22,5); ctx.stroke();
        }
        ctx.restore();
    }

    ctx.shadowBlur = 0;
    for(let i=particles.length-1; i>=0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.03;
        if(p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 6, 6); ctx.globalAlpha = 1.0;
    }
    ctx.restore();

}
