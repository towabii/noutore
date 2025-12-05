import * as THREE from 'three';

// --- 設定値 -----------------------------------------------
const CONFIG = {
    walkSpeed: 3.5,
    runSpeed: 7.0,
    mouseSensitivity: 0.002,
    
    // 道幅などのサイズ設定
    pathWidth: 8.0,       // 道幅
    pathHeight: 4.5,      // 天井高
    straightLen: 30.0,    // 直進通路の長さ
    turnLen: 25.0,        // 左折後の通路の長さ
    wallThickness: 1.0,   // 壁の厚み
    
    // 判定ライン
    loopTriggerX: -18.0,  // ループ判定X座標
    backTriggerZ: 10.0    // 引き返し判定Z座標
};

// --- グローバル変数 ---------------------------------------
let scene, camera, renderer, clock;
let mats = {}; 
let npc;
let posters = [];
let exitSignCanvas, exitSignTexture;
let yellowSignMesh;

let currentExit = 0;
let anomalyType = 'NONE'; 
let gameActive = false;
let isTransitioning = false;

const keys = {};
const startScreen = document.getElementById('start-screen');
const uiContainer = document.getElementById('ui-container');
const curtain = document.getElementById('blackout-curtain');

const textureLoader = new THREE.TextureLoader();

// --- 初期化 -----------------------------------------------
function init() {
    clock = new THREE.Clock();
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    scene.fog = new THREE.Fog(0xdddddd, 2, 40); // 霧の設定

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.rotation.order = 'YXZ'; 

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.body.appendChild(renderer.domElement);

    loadMaterials();
    createMap();
    createBrailleBlocks(); // 点字ブロック
    createProps();
    createNPC();
    createExitSign();
    setupEvents();

    animate();
}

// --- マテリアル読み込み -----------------------------------
function loadMaterials() {
    const loadTex = (path, repeatX, repeatY) => {
        const tex = textureLoader.load(path);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        if(repeatX) tex.repeat.set(repeatX, repeatY);
        return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
    };

    // 画像パスの修正 (jpg/フォルダ以下)
    mats.wall = loadTex('jpg/wall.jpg', 6, 2);
    mats.floor = loadTex('jpg/floor.jpg', 4, 10);
    mats.ceil = loadTex('jpg/tenjo.jpg', 4, 10); // 指定: tenjo.jpg
    mats.door = new THREE.MeshStandardMaterial({ map: textureLoader.load('jpg/doa.jpg') }); // 指定: doa.jpg
    
    // 点字ブロック用マテリアル（黄色）
    mats.braille = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.8 });

    // 看板（ポスター）
    mats.posters = [];
    mats.postersAnomaly = [];
    for(let i=1; i<=6; i++) {
        // 通常: 1.jpg, 2.jpg ...
        mats.posters.push(new THREE.MeshBasicMaterial({ map: textureLoader.load(`jpg/${i}.jpg`), color: 0xffffff }));
        // 異変: i1.jpg, i2.jpg ...
        mats.postersAnomaly.push(new THREE.MeshBasicMaterial({ map: textureLoader.load(`jpg/i${i}.jpg`), color: 0xffcccc }));
    }
}

// --- マップ作成（壁ズレ修正版） ---------------------------
function createMap() {
    const W = CONFIG.pathWidth;
    const H = CONFIG.pathHeight;
    const L1 = CONFIG.straightLen; 
    const L2 = CONFIG.turnLen;     
    const T = CONFIG.wallThickness;

    const createBox = (w, h, d, x, y, z, mat) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        return mesh;
    };

    // --- 床と天井 ---
    // 1. 直進エリア (Z=0中心ではなく、Start〜Corner手前までを基準に配置)
    // Start地点(Z=5)の背後から、Corner中心(-L1)まで
    const straightAreaLen = L1 + 10; // 少し余分に
    const straightCenterZ = 5 - straightAreaLen/2;
    
    createBox(W, 0.1, straightAreaLen, 0, 0, straightCenterZ, mats.floor);
    createBox(W, 0.1, straightAreaLen, 0, H, straightCenterZ, mats.ceil);

    // 2. 左折エリア
    // Corner中心(-L1)から左へL2
    const turnAreaCenterX = -W/2 - L2/2;
    const turnAreaCenterZ = -L1; // 突き当たりのZ位置

    createBox(L2, 0.1, W, turnAreaCenterX, 0.01, turnAreaCenterZ, mats.floor); // 少し浮かせて重なりチラつき防止
    createBox(L2, 0.1, W, turnAreaCenterX, H, turnAreaCenterZ, mats.ceil);

    // --- 壁（修正箇所） ---
    
    // A. 右壁（ずっと直進）
    // スタート地点後方(Z=10)から、突き当たり(Z=-L1-W/2)まで
    const rightWallZStart = 10;
    const rightWallZEnd = -L1 - W/2 - T; 
    const rightWallLen = rightWallZStart - rightWallZEnd;
    const rightWallZ = rightWallZStart - rightWallLen/2;
    createBox(T, H, rightWallLen, W/2 + T/2, H/2, rightWallZ, mats.wall);

    // B. 左壁（手前側）★ここが出っ張っていた箇所
    // スタート地点後方(Z=10)から、「左折通路の開始地点」まで
    // 左折通路の開始地点（手前側の壁）Z = -L1 + W/2
    const leftWallZEnd = -L1 + W/2; 
    const leftWallLen = rightWallZStart - leftWallZEnd;
    const leftWallZ = rightWallZStart - leftWallLen/2;
    
    // 壁の厚みを考慮して、角でピタリと合わせる
    // 左壁は X = -W/2 - T/2 に配置
    createBox(T, H, leftWallLen, -W/2 - T/2, H/2, leftWallZ, mats.wall);

    // C. 正面の壁（突き当たり）
    // Z = -L1 - W/2 - T/2 (突き当たり最奥)
    // 幅は右壁から左通路の奥までカバー
    const frontWallWidth = W + L2 + T*2; 
    createBox(frontWallWidth, H, T, -L2/2 + T, H/2, -L1 - W/2 - T/2, mats.wall);

    // D. 左折後の内側の壁（左手）★ここも調整
    // 位置: Z = -L1 + W/2 + T/2 (左壁の終わりと同じZラインより厚み分だけ手前＝内側の壁)
    // X方向: 直進路の左端(X = -W/2) から 左奥へ
    const innerWallXStart = -W/2 - T; // 左壁と接続
    const innerWallXEnd = -W/2 - L2;
    const innerWallLen = Math.abs(innerWallXEnd - innerWallXStart);
    const innerWallX = innerWallXStart - innerWallLen/2;

    // 左壁(B)の「側面」が見えないように、内側の壁(D)と接続する
    // 左壁の終わりは Z = -L1 + W/2。
    // 内側壁のZ位置は Z = -L1 + W/2 + T/2。
    createBox(innerWallLen, H, T, innerWallX, H/2, -L1 + W/2 + T/2, mats.wall);

    // E. スタート背面の壁
    createBox(W + T*2, H, T, 0, H/2, 8, mats.wall);

    // --- 照明 ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    for(let z = 5; z > -L1; z -= 8) {
        createLight(0, H, z, false);
    }
    createLight(-W - 5, H, -L1, true);
}

function createLight(x, y, z, isRotated) {
    const light = new THREE.PointLight(0xffffff, 0.5, 15);
    light.position.set(x, y - 0.5, z);
    scene.add(light);

    const geo = new THREE.BoxGeometry(0.5, 0.1, 1.5);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    if(isRotated) mesh.rotation.y = Math.PI / 2;
    scene.add(mesh);
}

// --- 点字ブロック作成 -------------------------------------
function createBrailleBlocks() {
    const W = CONFIG.pathWidth;
    const L1 = CONFIG.straightLen;
    const L2 = CONFIG.turnLen;

    // 1. 直進部分（スタートから曲がり角手前まで）
    // Z=5 から Z=-L1+W/2 まで
    const straightLen = 5 - (-L1 + W/2);
    const straightZ = 5 - straightLen/2;
    
    const block1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.02, straightLen),
        mats.braille
    );
    block1.position.set(0, 0.02, straightZ); // 床よりわずかに上
    scene.add(block1);

    // 2. コーナー部分（四角い結合部）
    const cornerBlock = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.02, 0.6),
        mats.braille
    );
    // 直進ライン(X=0) と 左折ライン(Z=-L1) の交差点ではなく、
    // L字に曲がる角の軌道に合わせて配置。
    // 今回はシンプルに、直進路の終わりから左へ曲がる配置にします。
    // 直進の終わり: Z = -L1 + W/2
    cornerBlock.position.set(0, 0.02, -L1 + W/2 - 0.3); // 少し調整
    scene.add(cornerBlock);

    // 3. 左折部分
    // コーナーから左へ
    // X=0 から X=-L2 まで
    const turnLen = L2;
    const block2 = new THREE.Mesh(
        new THREE.BoxGeometry(turnLen, 0.02, 0.6),
        mats.braille
    );
    block2.position.set(-turnLen/2, 0.02, -L1 + W/2 - 0.3);
    scene.add(block2);
}

// --- 小物配置 ---------------------------------------------
function createProps() {
    // ポスター（左壁に配置）
    for(let i=0; i<6; i++) {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.2), mats.posters[i]);
        // 左壁の内側表面: X = -CONFIG.pathWidth/2
        p.position.set(-CONFIG.pathWidth/2 + 0.05, 2.0, 0 - (i * 4.5));
        p.rotation.y = Math.PI / 2;
        scene.add(p);
        posters.push(p);
    }

    // ドア（右壁に配置）
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 4.0), mats.door);
    door.position.set(CONFIG.pathWidth/2 - 0.05, 2.0, -10);
    door.rotation.y = -Math.PI / 2;
    scene.add(door);
}

// --- 看板作成 ---------------------------------------------
function createExitSign() {
    exitSignCanvas = document.createElement('canvas');
    exitSignCanvas.width = 512;
    exitSignCanvas.height = 256;
    exitSignTexture = new THREE.CanvasTexture(exitSignCanvas);
    
    const geo = new THREE.BoxGeometry(2.0, 1.0, 0.1);
    const mat = new THREE.MeshBasicMaterial({ map: exitSignTexture });
    yellowSignMesh = new THREE.Mesh(geo, mat);

    // 配置: 突き当たりの壁の手前、通路中央
    const zPos = -CONFIG.straightLen - CONFIG.pathWidth/2 + 0.5;
    yellowSignMesh.position.set(0, 2.5, zPos);
    
    scene.add(yellowSignMesh);
    updateExitSign();
}

function updateExitSign() {
    const ctx = exitSignCanvas.getContext('2d');
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 0, 512, 256);
    ctx.lineWidth = 15;
    ctx.strokeStyle = '#000';
    ctx.strokeRect(0, 0, 512, 256);
    
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    
    ctx.font = 'bold 60px sans-serif';
    ctx.fillText('出口', 256, 70);
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('Exit', 256, 120);
    ctx.font = 'bold 120px sans-serif';
    ctx.fillText(currentExit.toString(), 256, 220);
    
    exitSignTexture.needsUpdate = true;
}

// --- おじさん（箱） ---------------------------------------
function createNPC() {
    const geometry = new THREE.BoxGeometry(1.5, 2.5, 1.5);
    const material = new THREE.MeshStandardMaterial({ color: 0x333333 });
    npc = new THREE.Mesh(geometry, material);
    npc.visible = false;
    scene.add(npc);
}

// --- ゲーム進行 -------------------------------------------
function startGame() {
    startScreen.style.display = 'none';
    uiContainer.classList.remove('hidden');
    document.body.requestPointerLock();
    gameActive = true;
    currentExit = 0;
    resetRound(true);
}

function resetRound(firstTime = false) {
    // スポーン地点（点字ブロックの上あたり）
    camera.position.set(0, 1.7, 5.0);
    camera.rotation.set(0, 0, 0);

    npc.visible = false;
    posters.forEach((p, i) => p.material = mats.posters[i]);
    updateExitSign();

    anomalyType = 'NONE';
    if (!firstTime && Math.random() < 0.5) {
        if (Math.random() < 0.5) {
            anomalyType = 'POSTER';
            const idx = Math.floor(Math.random() * 6);
            posters[idx].material = mats.postersAnomaly[idx];
        } else {
            anomalyType = 'NPC';
            npc.visible = true;
            // 突き当たりの看板の下あたり
            const zPos = -CONFIG.straightLen - CONFIG.pathWidth/2 + 2.5;
            npc.position.set(0, 1.25, zPos);
        }
    }
}

function handleBlackout(isSuccess) {
    if (isTransitioning) return;
    isTransitioning = true;
    curtain.style.opacity = 1;

    setTimeout(() => {
        if (isSuccess) currentExit++;
        else currentExit = 0;

        if (currentExit >= 8) {
            alert("脱出成功！");
            location.reload();
            return;
        }
        resetRound();
        setTimeout(() => {
            curtain.style.opacity = 0;
            isTransitioning = false;
        }, 500);
    }, 600);
}

function seamlessLoop() {
    currentExit++;
    if (currentExit >= 8) {
        handleBlackout(true);
        return;
    }

    // ワープ処理
    camera.rotation.y -= Math.PI / 2;
    camera.position.set(0, 1.7, 2.0);

    npc.visible = false;
    posters.forEach((p, i) => p.material = mats.posters[i]);
    updateExitSign();

    anomalyType = 'NONE';
    if (Math.random() < 0.5) {
        if (Math.random() < 0.5) {
            anomalyType = 'POSTER';
            const idx = Math.floor(Math.random() * 6);
            posters[idx].material = mats.postersAnomaly[idx];
        } else {
            anomalyType = 'NPC';
            npc.visible = true;
            const zPos = -CONFIG.straightLen - CONFIG.pathWidth/2 + 2.5;
            npc.position.set(0, 1.25, zPos);
        }
    }
}

// --- 更新ループ -------------------------------------------
function update(delta) {
    if (isTransitioning) return;

    // おじさん接近
    if (anomalyType === 'NPC' && npc.visible) {
        if (camera.position.z < -5) {
            npc.position.z += delta * 8.0;
        }
    }

    updatePlayer(delta);

    const p = camera.position;

    // ループ判定
    if (p.x < CONFIG.loopTriggerX) {
        if (anomalyType === 'NONE') seamlessLoop();
        else handleBlackout(false);
    }
    // 戻り判定
    if (p.z > CONFIG.backTriggerZ) {
        if (anomalyType !== 'NONE') handleBlackout(true);
        else handleBlackout(false);
    }
}

function updatePlayer(delta) {
    const speed = keys['ShiftLeft'] ? CONFIG.runSpeed : CONFIG.walkSpeed;
    const dist = speed * delta;
    
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    fwd.y = 0; fwd.normalize();
    const right = new THREE.Vector3().crossVectors(fwd, camera.up).normalize();

    const move = new THREE.Vector3();
    if (keys['KeyW']) move.add(fwd);
    if (keys['KeyS']) move.sub(fwd);
    if (keys['KeyD']) move.add(right);
    if (keys['KeyA']) move.sub(right);

    if (move.length() > 0) {
        move.normalize().multiplyScalar(dist);
        const next = camera.position.clone().add(move);

        // --- 当たり判定 ---
        const wallOffset = CONFIG.pathWidth / 2 - 0.5;
        const cornerZ = -CONFIG.straightLen + CONFIG.pathWidth/2;

        // 1. 直進エリア
        if (next.z > cornerZ) {
            next.x = Math.max(-wallOffset, Math.min(wallOffset, next.x));
        } 
        // 2. 左折エリア
        else {
            const maxZ = -CONFIG.straightLen - CONFIG.pathWidth/2 + 0.5;
            // 突き当たり壁の手前 〜 コーナーの手前
            next.z = Math.max(maxZ, Math.min(cornerZ + wallOffset, next.z));
        }
        camera.position.copy(next);
    }
}

function setupEvents() {
    startScreen.addEventListener('click', startGame);
    document.addEventListener('keydown', e => keys[e.code] = true);
    document.addEventListener('keyup', e => keys[e.code] = false);
    document.addEventListener('mousemove', e => {
        if (!gameActive || document.pointerLockElement !== document.body) return;
        camera.rotation.y -= e.movementX * CONFIG.mouseSensitivity;
        camera.rotation.x -= e.movementY * CONFIG.mouseSensitivity;
        camera.rotation.x = Math.max(-1.5, Math.min(1.5, camera.rotation.x));
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (gameActive) update(clock.getDelta());
    renderer.render(scene, camera);
}

init();
