const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// =================================================================
// --- ゲーム設定 ---
// =================================================================
const MAX_PLAYABLE_LEVEL = 5; // この数値を変更すると遊べるレベルが増えます (例: 3にするとレベル3がプレイ可能に)

// --- 画面設定 ---
const VIRTUAL_WIDTH = 1500;
const VIRTUAL_HEIGHT = 860;

// --- 物理演算・挙動設定 (ここを調整してゲームバランスを変更します) ---
const TILE_SIZE = 64;
const BASE_SPEED = 9.5; 
const ROTATION_SPEED = 0.13;
const GROUND_HEIGHT = 2; 

const GRAVITY_CUBE = 1.1; 
const JUMP_CUBE = -17.5; // ジャンプ力 (数値を小さくすると高く飛ぶ)
const JUMP_ORB = -14.0;
const JUMP_PAD = -21.0;

const GRAVITY_SHIP = 0.4;
const SHIP_THRUST = -0.8; 
const SHIP_MAX_UP = -9.0;
const SHIP_MAX_DOWN = 10.0;


// --- Audio (変更なし) ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
const SOUNDS = { jump: { freq: 400, type: 'square', decay: 0.1 }, die: { freq: 150, type: 'sawtooth', decay: 0.5 }, pad: { freq: 600, type: 'sine', decay: 0.2 }, orb: { freq: 700, type: 'sine', decay: 0.1 }, portal: { freq: 200, type: 'square', decay: 0.3 }, win: { freq: 880, type: 'triangle', decay: 1.0 } };
function playSound(name) { if (!audioCtx) return; const s = SOUNDS[name]; const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = s.type; osc.frequency.setValueAtTime(s.freq, audioCtx.currentTime); if (name === 'jump') osc.frequency.exponentialRampToValueAtTime(s.freq + 200, audioCtx.currentTime + 0.1); if (name === 'die') osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3); if (name === 'portal') osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.3); if (name === 'pad') osc.frequency.exponentialRampToValueAtTime(s.freq + 300, audioCtx.currentTime + 0.2); gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + s.decay); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + s.decay); }
let bgmInterval;
function startBGM() { if (bgmInterval) clearInterval(bgmInterval); if (!audioCtx) return; let beat = 0; bgmInterval = setInterval(() => { if(gameState !== 'PLAYING') return; const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination); const baseFreq = player.mode === 'SHIP' ? 55 : 45; const freq = (beat % 4 === 0) ? baseFreq * 2 : (beat % 8 === 6 ? baseFreq * 1.5 : baseFreq); osc.frequency.setValueAtTime(freq, audioCtx.currentTime); osc.type = 'triangle'; gain.gain.setValueAtTime(0.08, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2); osc.start(); osc.stop(audioCtx.currentTime + 0.2); beat++; }, 150); }

// --- 変数 ---
let currentLevel = 1;
let gameState = 'STAFF_ROLL';
let animationFrameId = null;
let player = { x: 0, y: 0, w: TILE_SIZE-14, h: TILE_SIZE-14, dy: 0, angle: 0, isGrounded: false, dead: false, mode: 'CUBE', gravity: 1, trail: [] };
let input = { holding: false };
let camera = { x: 0 };
let blocks = [];
let triggers = [];
let decorations = [];
let particles = [];
let mapWidth = 0;
let bgHue = 240;
let floorY = VIRTUAL_HEIGHT - (TILE_SIZE * GROUND_HEIGHT);

// --- 画面リサイズ処理 (変更なし) ---
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '';
    canvas.style.height = '';
    canvas.style.position = '';
    canvas.style.left = '';
    canvas.style.top = '';
}
window.addEventListener('resize', resize);
resize();

function getHighScore(lvl) { return localStorage.getItem('metadash_hs_'+lvl) || 0; }
function saveHighScore(lvl, sc) { if(sc > getHighScore(lvl)) localStorage.setItem('metadash_hs_'+lvl, sc); }

window.onload = function() {
    const staffRollScreen = document.getElementById('staff-roll-screen');
    const skipBtn = document.getElementById('skipBtn');
    const creditsList = document.querySelector('.credits-list');
    function transitionToMenu() {
        if (gameState !== 'STAFF_ROLL') return;
        gameState = 'MENU';
        staffRollScreen.style.display = 'none';
        document.getElementById('menu-screen').style.display = 'flex';
        skipBtn.removeEventListener('click', transitionToMenu);
        creditsList.removeEventListener('animationend', transitionToMenu);
        resize(); draw();
    }
    skipBtn.addEventListener('click', transitionToMenu);
    creditsList.addEventListener('animationend', transitionToMenu);
};

function initGame(lvl) {
    if (lvl > MAX_PLAYABLE_LEVEL) return;
    if (!audioCtx) audioCtx = new AudioContext();
    else if (audioCtx.state === 'suspended') audioCtx.resume();
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
    currentLevel = lvl;
    gameState = 'PLAYING';
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('ui-layer').style.display = 'block';
    document.getElementById('message').style.display = 'none';
    document.getElementById('level-indicator').innerText = "LEVEL " + lvl;
    resetLevel();
    startBGM();
    loop();
}

function resetLevel() {
    blocks = []; triggers = []; decorations = [];
    const layout = getLevelMap(currentLevel);
    if(!layout || layout.length === 0) return;
    const rows = layout.length; const cols = layout[0].length;
    mapWidth = cols * TILE_SIZE;
    const bottomRowY = floorY - TILE_SIZE;
    for (let r = 0; r < rows; r++) {
        const rowStr = layout[r]; const by = bottomRowY - ((rows - 1 - r) * TILE_SIZE);
        for (let c = 0; c < rowStr.length; c++) {
            const ch = rowStr[c]; const bx = c * TILE_SIZE;
            if(ch === ' ') continue;
            let b = {x:bx, y:by, w:TILE_SIZE, h:TILE_SIZE, type:''};
            if ('o>|'.includes(ch)) {
                if (ch === 'o') b.type = 'DECO_CIRCLE'; if (ch === '>') b.type = 'DECO_ARROW'; if (ch === '|') b.type = 'DECO_CHAIN';
                decorations.push(b);
            } else if(ch === '#') { b.type = 'BLOCK'; blocks.push(b); }
            else if(ch === '^') { b.type = 'SPIKE'; b.dx = bx; b.dy = by; blocks.push(b); }
            else if(ch === 'v') { b.type = 'SPIKE_DOWN'; b.dx = bx; b.dy = by; blocks.push(b); }
            else if(ch === 'J') { b.type = 'PAD'; b.h = 20; b.y = by + TILE_SIZE - 20; b.w -= 20; b.x +=10; triggers.push(b); }
            else if(ch === 'O') { b.type = 'ORB'; b.w = 40; b.h = 40; b.x += 12; b.y += 12; triggers.push(b); }
            else if(ch === 'S') { b.type = 'PORTAL_SHIP'; b.w = 50; b.h = TILE_SIZE*2; triggers.push(b); }
            else if(ch === 'C') { b.type = 'PORTAL_CUBE'; b.w = 50; b.h = TILE_SIZE*2; triggers.push(b); }
            else if(ch === 'V') { b.type = 'PORTAL_GRAVITY_REVERSE'; b.w = 50; b.h = TILE_SIZE*2; triggers.push(b); }
            else if(ch === 'N') { b.type = 'PORTAL_GRAVITY_NORMAL'; b.w = 50; b.h = TILE_SIZE*2; triggers.push(b); }
            else if(ch === 'G') { b.type = 'GOAL'; b.y = 0; b.h = VIRTUAL_HEIGHT; triggers.push(b); }
        }
    }
    player.x = 0; player.y = floorY - player.h; player.dy = 0; player.angle = 0;
    player.dead = false; player.mode = 'CUBE'; player.gravity = 1; 
    player.trail = []; input.holding = false; camera.x = 0; particles = []; bgHue = 240; 
}

function loop() {
    update();
    draw();
    if(gameState !== 'MENU' && gameState !== 'STAFF_ROLL') {
        animationFrameId = requestAnimationFrame(loop);
    }
}

function update() {
    if (gameState !== 'PLAYING' || player.dead) return;
    bgHue = (bgHue + 0.1); if(bgHue > 260) bgHue = 220; 
    if (Date.now() % 3 === 0) { player.trail.push({x: player.x, y: player.y, angle: player.angle, alpha: 0.6, mode: player.mode}); if(player.trail.length > 10) player.trail.shift(); }
    player.x += BASE_SPEED;
    if (player.mode === 'CUBE') {
        player.dy += GRAVITY_CUBE * player.gravity; player.y += player.dy;
        if (!player.isGrounded) player.angle += ROTATION_SPEED * player.gravity;
        else { const target = Math.round(player.angle / (Math.PI/2)) * (Math.PI/2); player.angle += (target - player.angle) * 0.3; }
    } else if (player.mode === 'SHIP') {
        if (input.holding) player.dy += SHIP_THRUST * player.gravity; 
        player.dy += GRAVITY_SHIP * player.gravity;
        const maxUp = player.gravity > 0 ? SHIP_MAX_UP : SHIP_MAX_DOWN * -1;
        const maxDown = player.gravity > 0 ? SHIP_MAX_DOWN : SHIP_MAX_UP * -1;
        if (player.gravity > 0) { if(player.dy < maxUp) player.dy = maxUp; if(player.dy > maxDown) player.dy = maxDown; }
        else { if(player.dy > maxUp) player.dy = maxUp; if(player.dy < maxDown) player.dy = maxDown; }
        player.y += player.dy;
        let targetAngle = player.dy * 0.05 * player.gravity;
        player.angle += (targetAngle - player.angle) * 0.1;
    }
    player.isGrounded = false;
    if (player.gravity > 0 && player.y + player.h >= floorY) { player.y = floorY - player.h; player.dy = 0; player.isGrounded = true; if(player.mode === 'CUBE') player.angle = Math.round(player.angle / (Math.PI/2)) * (Math.PI/2); }
    if (player.gravity < 0 && player.y <= TILE_SIZE) { player.y = TILE_SIZE; player.dy = 0; player.isGrounded = true; if(player.mode === 'CUBE') player.angle = Math.round(player.angle / (Math.PI/2)) * (Math.PI/2); }
    checkSolids();
    if(player.dead) return;
    checkTriggers();
    // =================================================================
    // --- 修正点: カメラの位置をキャラクターに寄せる ---
    // =================================================================
    camera.x = player.x - (VIRTUAL_WIDTH / 3); // 1/4 から 1/3 に変更して中央に寄せる

    const pct = Math.min(100, Math.floor((player.x / mapWidth) * 100));
    document.getElementById('current-progress').innerText = `${pct}%`;
    document.getElementById('high-score').innerText = `自己ベスト: ${getHighScore(currentLevel)}%`;
}

function checkTriggers() {
    const px = player.x + 10, py = player.y + 5, pw = player.w - 20, ph = player.h - 10;
    for (let t of triggers) {
        if (px + pw > t.x && px < t.x + t.w && py + ph > t.y && py < t.y + t.h) {
            if (t.type === 'PAD') { playSound('pad'); player.dy = JUMP_PAD * player.gravity; player.isGrounded = false; createParticles(t.x + t.w/2, t.y, 10, '#ffff00'); return; }
            else if (t.type === 'PORTAL_SHIP') { if(player.mode !== 'SHIP') { player.mode = 'SHIP'; playSound('portal'); createParticles(player.x, player.y, 20, '#00ff00'); } }
            else if (t.type === 'PORTAL_CUBE') { if(player.mode !== 'CUBE') { player.mode = 'CUBE'; player.angle = 0; playSound('portal'); createParticles(player.x, player.y, 20, '#ff8800'); } }
            else if (t.type === 'PORTAL_GRAVITY_REVERSE') { if (player.gravity > 0) { player.gravity = -1; playSound('portal'); createParticles(player.x, player.y, 20, '#a020f0'); } }
            else if (t.type === 'PORTAL_GRAVITY_NORMAL') { if (player.gravity < 0) { player.gravity = 1; playSound('portal'); createParticles(player.x, player.y, 20, '#ffffff'); } }
            else if (t.type === 'GOAL') { levelClear(); }
        }
    }
}
function checkSolids() {
    const marginX = 24, px = player.x + marginX, pw = player.w - (marginX * 2), py = player.y, ph = player.h;
    for (let b of blocks) {
        if (px + pw > b.x && px < b.x + b.w && py + ph > b.y && py < b.y + b.h) {
            if (b.type === 'SPIKE' || b.type === 'SPIKE_DOWN') { die(); return; }
            if (b.type === 'BLOCK') {
                const playerPrevY = player.y - player.dy;
                if (player.gravity > 0 && player.dy >= 0 && playerPrevY + ph <= b.y) { player.y = b.y - ph; player.dy = 0; player.isGrounded = true; }
                else if (player.gravity < 0 && player.dy <= 0 && playerPrevY >= b.y + b.h) { player.y = b.y + b.h; player.dy = 0; player.isGrounded = true; }
                else if (player.gravity > 0 && player.dy < 0 && playerPrevY >= b.y + b.h) { player.y = b.y + b.h; player.dy = 0; }
                else if (player.gravity < 0 && player.dy > 0 && playerPrevY + ph <= b.y + b.h) { player.y = b.y - ph; player.dy = 0; }
                else { die(); return; }
            }
        }
    }
}

function handleInputStart() {
    if (gameState === 'MENU' || gameState === 'STAFF_ROLL') return;
    if (gameState === 'GAMEOVER' || gameState === 'CLEARED') { initGame(currentLevel); return; }
    input.holding = true;
    if (player.mode === 'CUBE') {
        let hitOrb = false;
        const cx = player.x + player.w/2, cy = player.y + player.h/2;
        for(let t of triggers) {
            if(t.type === 'ORB' && cx > t.x && cx < t.x + t.w && cy > t.y && cy < t.y + t.h) {
                playSound('orb'); player.dy = JUMP_ORB * player.gravity; player.isGrounded = false; createParticles(t.x+t.w/2, t.y+t.h/2, 10, '#00ffff'); hitOrb = true; break;
            }
        }
        if (!hitOrb && player.isGrounded) { playSound('jump'); player.dy = JUMP_CUBE * player.gravity; player.isGrounded = false; createParticles(player.x + player.w/2, player.y + player.h, 5, '#fff'); }
    }
}
function handleInputEnd() { input.holding = false; }
window.addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'ArrowUp') handleInputStart(); if (e.code === 'Escape') { if (gameState === 'PLAYING') { gameState = 'MENU'; document.getElementById('menu-screen').style.display = 'flex'; document.getElementById('ui-layer').style.display = 'none'; if(animationFrameId) cancelAnimationFrame(animationFrameId); animationFrameId = null; resize(); draw(); } } });
window.addEventListener('keyup', e => { if (e.code === 'Space' || e.code === 'ArrowUp') handleInputEnd(); });
window.addEventListener('mousedown', handleInputStart); window.addEventListener('mouseup', handleInputEnd);
window.addEventListener('touchstart', (e) => { e.preventDefault(); handleInputStart(); }, {passive:false});
window.addEventListener('touchend', (e) => { e.preventDefault(); handleInputEnd(); });

function die() { if (player.dead) return; player.dead = true; playSound('die'); gameState = 'GAMEOVER'; saveHighScore(currentLevel, Math.floor((player.x/mapWidth)*100)); createParticles(player.x, player.y, 50, '#ff0000'); document.getElementById('message').innerHTML = "CRASHED<br><span style='font-size:20px'>Press SPACE to retry</span>"; document.getElementById('message').style.display = 'block'; }
function levelClear() { player.dead = true; gameState = 'CLEARED'; playSound('win'); saveHighScore(currentLevel, 100); document.getElementById('message').innerHTML = "<span style='color:#0f0'>LEVEL CLEAR!</span><br><span style='font-size:20px'>Press SPACE to continue</span>"; document.getElementById('message').style.display = 'block'; }
function createParticles(x, y, count, color) { for(let i=0; i<count; i++) { particles.push({x:x, y:y, vx:(Math.random()-0.5)*15, vy:(Math.random()-0.5)*15, life:1.0, color:color}); } }

function draw() {
    ctx.save();
    const scale = Math.max(canvas.width / VIRTUAL_WIDTH, canvas.height / VIRTUAL_HEIGHT);
    const offsetX = (canvas.width - VIRTUAL_WIDTH * scale) / 2;
    const offsetY = (canvas.height - VIRTUAL_HEIGHT * scale) / 2;
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    ctx.fillStyle = `hsl(${bgHue}, 50%, 15%)`; 
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    
    ctx.save();
    ctx.translate(-camera.x * 0.2, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2;
    const gx = Math.floor(camera.x * 0.2 / 100) * 100;
    for(let x=gx; x<gx+VIRTUAL_WIDTH+200; x+=100) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, VIRTUAL_HEIGHT); ctx.stroke(); }
    ctx.restore();
    
    ctx.save();
    ctx.translate(-camera.x, 0);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(camera.x, floorY, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - floorY);
    ctx.fillRect(camera.x, 0, VIRTUAL_WIDTH, TILE_SIZE);
    ctx.strokeStyle = `hsl(${bgHue}, 100%, 50%)`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(camera.x, floorY); ctx.lineTo(camera.x+VIRTUAL_WIDTH, floorY); ctx.stroke();
    ctx.strokeStyle = `hsl(${(bgHue+120)%360}, 100%, 50%)`;
    ctx.beginPath(); ctx.moveTo(camera.x, TILE_SIZE); ctx.lineTo(camera.x+VIRTUAL_WIDTH, TILE_SIZE); ctx.stroke();

    for(let d of decorations) {
        if(d.x+d.w < camera.x || d.x > camera.x+VIRTUAL_WIDTH) continue;
        ctx.globalAlpha = 0.5; ctx.strokeStyle = '#555'; ctx.lineWidth = 4;
        if(d.type === 'DECO_CIRCLE') { ctx.beginPath(); ctx.arc(d.x+d.w/2, d.y+d.h/2, d.w/2.5, 0, Math.PI*2); ctx.stroke(); }
        else if (d.type === 'DECO_ARROW') { ctx.beginPath(); ctx.moveTo(d.x, d.y+d.h/2); ctx.lineTo(d.x+d.w, d.y+d.h/2); ctx.lineTo(d.x+d.w-20, d.y+d.h/2-20); ctx.moveTo(d.x+d.w, d.y+d.h/2); ctx.lineTo(d.x+d.w-20, d.y+d.h/2+20); ctx.stroke(); }
        else if (d.type === 'DECO_CHAIN') { for(let i=0; i<4; i++){ ctx.beginPath(); ctx.arc(d.x+d.w/2, d.y+i*20, 10, 0, Math.PI*2); ctx.stroke(); } }
        ctx.globalAlpha = 1.0;
    }

    for(let b of blocks) {
        if(b.x+b.w < camera.x || b.x > camera.x+VIRTUAL_WIDTH) continue;
        if(b.type === 'BLOCK') {
            ctx.fillStyle = '#000'; ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeStyle = '#0ff'; ctx.lineWidth=2; ctx.strokeRect(b.x, b.y, b.w, b.h);
            ctx.fillStyle = 'rgba(0,255,255,0.1)'; ctx.fillRect(b.x+5, b.y+5, b.w-10, b.h-10);
        } else if(b.type === 'SPIKE' || b.type === 'SPIKE_DOWN') {
            const grad = ctx.createLinearGradient(b.dx, b.dy, b.dx, b.dy + TILE_SIZE); grad.addColorStop(0, '#ff4444'); grad.addColorStop(1, '#8b0000');
            ctx.fillStyle = grad; ctx.strokeStyle = '#400'; ctx.lineWidth = 2;
            ctx.beginPath();
            if(b.type === 'SPIKE') { ctx.moveTo(b.dx, b.dy+TILE_SIZE); ctx.lineTo(b.dx+TILE_SIZE/2, b.dy); ctx.lineTo(b.dx+TILE_SIZE, b.dy+TILE_SIZE); }
            else { ctx.moveTo(b.dx, b.dy); ctx.lineTo(b.dx+TILE_SIZE, b.dy); ctx.lineTo(b.dx+TILE_SIZE/2, b.dy+TILE_SIZE); }
            ctx.closePath(); ctx.fill(); ctx.stroke();
        }
    }
    for(let t of triggers) {
        if(t.x+t.w < camera.x || t.x > camera.x+VIRTUAL_WIDTH) continue;
        if(t.type === 'PAD') { ctx.fillStyle = '#ff0'; ctx.beginPath(); ctx.arc(t.x+(t.w/2), t.y+t.h, t.w/2, Math.PI, 0); ctx.fill(); }
        else if(t.type === 'ORB') { ctx.fillStyle = 'rgba(255,255,0,0.3)'; ctx.beginPath(); ctx.arc(t.x+t.w/2, t.y+t.h/2, t.w/2, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = '#ff0'; ctx.lineWidth=3; ctx.stroke(); }
        else if(t.type.startsWith('PORTAL')) {
            const colors = { PORTAL_SHIP: '#0f0', PORTAL_CUBE: '#f80', PORTAL_GRAVITY_REVERSE: '#a0f', PORTAL_GRAVITY_NORMAL: '#fff'};
            const color = colors[t.type];
            ctx.strokeStyle = color; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(t.x, t.y); ctx.lineTo(t.x, t.y + t.h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(t.x + t.w, t.y); ctx.lineTo(t.x + t.w, t.y + t.h); ctx.stroke();
            for(let i=0; i < 10; i++) {
                const yOffset = (Date.now() * 0.2 * (i % 2 === 0 ? 1 : -1.2) + i * 30) % t.h;
                ctx.fillStyle = color; ctx.globalAlpha = Math.sin(yOffset / t.h * Math.PI) * 0.5 + 0.2;
                ctx.fillRect(t.x, t.y + yOffset, t.w, 3);
            }
            ctx.globalAlpha = 1.0;
        } else if(t.type === 'GOAL') { ctx.fillStyle = 'rgba(255,255,0,0.2)'; ctx.fillRect(t.x, t.y, t.w, VIRTUAL_HEIGHT); }
    }
    if(!player.dead) {
        player.trail.forEach(t => { ctx.save(); ctx.translate(t.x+player.w/2, t.y+player.h/2); ctx.rotate(t.angle); ctx.scale(1, player.gravity); ctx.fillStyle = `rgba(0,255,255,${t.alpha*0.4})`; if(t.mode==='SHIP') { ctx.beginPath(); ctx.moveTo(player.w/2,0); ctx.lineTo(-player.w/2,player.h/3); ctx.lineTo(-player.w/2,-player.h/3); ctx.fill(); } else { ctx.fillRect(-player.w/2, -player.h/2, player.w, player.h); } ctx.restore(); t.alpha -= 0.05; });
        player.trail = player.trail.filter(t => t.alpha > 0);
        ctx.save();
        ctx.translate(player.x+player.w/2, player.y+player.h/2);
        ctx.rotate(player.angle);
        ctx.scale(1, player.gravity);
        if(player.mode === 'SHIP') {
            ctx.fillStyle = '#f0f'; ctx.strokeStyle='#fff'; ctx.lineWidth=3;
            ctx.beginPath(); ctx.moveTo(player.w/2, 0); ctx.lineTo(-player.w/2, player.h/3); ctx.lineTo(-player.w/4, 0); ctx.lineTo(-player.w/2, -player.h/3); ctx.closePath();
            ctx.fill(); ctx.stroke();
        } else {
            ctx.fillStyle = '#0f0'; ctx.strokeStyle = '#000'; ctx.lineWidth = 4;
            ctx.fillRect(-player.w/2, -player.h/2, player.w, player.h);
            ctx.strokeRect(-player.w/2, -player.h/2, player.w, player.h);
            ctx.fillStyle = '#000'; const innerSize = player.w / 3;
            ctx.fillRect(-innerSize/2, -innerSize/2, innerSize, innerSize);
        }
        ctx.restore();
    }
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.03;
        if(p.life <= 0) { particles.splice(i, 1); }
        else { ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fillRect(p.x-3, p.y-3, 6, 6); }
    }
    ctx.globalAlpha = 1.0;
    
    ctx.restore();
    ctx.restore();
}