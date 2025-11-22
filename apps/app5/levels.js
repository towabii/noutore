/**
 * Level Data - Stereo Madness Style (Adjusted for Playability)
 * 
 * コンセプト: 動画(本家Stereo Madness)のレイアウトを再現しつつ、
 * このゲームの物理挙動に合わせて「絶対に詰まない」ように調整。
 * 
 * ルール:
 * 1. 床から直接乗れるのは高さ2ブロックまで。
 * 2. 高さ3以上の場所には、必ず手前に「踏み台」を置く。
 * 3. 穴やトゲは飛び越えられる距離に制限。
 */

const H = 14; 

function joinChunks(chunks) {
    let result = new Array(H).fill("");
    chunks.forEach(chunk => {
        for (let i = 0; i < H; i++) {
            const line = (i < chunk.length) ? chunk[i] : "          ";
            result[i] += line;
        }
    });
    return result;
}

// ==========================================
//  STEREO MADNESS PARTS (CUBE)
// ==========================================

const FLAT = [ 
    "               ", "               ", "               ", "               ", "               ", "               ", "               ",
    "               ", "               ", "               ", "               ", "               ", "               ", "               "
];

// 序盤: 基本のジャンプ
const SM_INTRO_1 = [
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "      ####          ", // 高さ1
    "      ####   ^      "
];

// 序盤: 高さ2へのジャンプ
const SM_INTRO_2 = [
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "         ####       ", // 高さ2
    "         ####       ",
    "   ^     ####       "
];

// 階段エリア（安全対策済み）
// 本家は直角だが、ここは踏み台をつけて登りやすく
const SM_STAIRS = [
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "             ###    ", // 3段目
    "        ###  ###    ", // 2段目
    "   ###  ###  ###    ", // 1段目 (踏み台)
    "   ###  ###  ###    ",
    "   ###  ###  ###    "
];

// 階段降り & 柱
const SM_PILLARS = [
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ", // 高さ3以上は置かない
    "###                 ",
    "###      ####       ", // 高さ2の柱
    "###  ^^  ####  ^^   ",
    "###      ####       "
];

// 連続ブロック（リズムよく）
const SM_BLOCKS = [
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "    ###    ###      ", // 高さ2
    "    ###    ###      ",
    " ## ### ## ### ##   "  // 間の踏み台で安全確保
];

// 飛行船への入り口（高い壁はパッドで）
const SM_PRE_SHIP = [
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "          #         ",
    "          #         ",
    "          #         ",
    "       J  #         ", // ジャンプパッド
    "      #####         ",
    "     #######        ",
    "    ########        ",
    "   #########        "
];

// ==========================================
//  STEREO MADNESS PARTS (SHIP)
// ==========================================

// 飛行開始
const P_SHIP = [ "          ", "          ", "   S      ", "   S      ", "   S      ", "   S      ", "          ", "          ", "          ", "          ", "          ", "          ", "          ", "          " ];

// ゆるやかなトンネル
const SM_SHIP_1 = [
    "######        ######",
    "#####          #####",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "#####          #####",
    "######        ######"
];

// 障害物（中央）
const SM_SHIP_2 = [
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "      ####          ", // 上の障害物
    "      ####          ",
    "                    ",
    "                    ",
    "          ####      ", // 下の障害物
    "          ####      ",
    "                    ",
    "                    ",
    "                    "
];

// 狭い門（でも通り抜け可能）
const SM_SHIP_GATE = [
    "#######      #######",
    "######        ######",
    "#####          #####",
    "####            ####",
    "                    ", // ここを通る
    "                    ",
    "                    ",
    "                    ",
    "####            ####",
    "#####          #####",
    "######        ######",
    "#######      #######",
    "########    ########",
    "#########  #########"
];

const P_CUBE = [ "          ", "          ", "   C      ", "   C      ", "   C      ", "   C      ", "          ", "          ", "          ", "          ", "          ", "          ", "          ", "          " ];

// ==========================================
//  RED SECTION (後半)
// ==========================================

// 3連トゲ（に見せかけた安全版）
// 判定の厳しい3連トゲの代わりに、2連トゲ＋足場にする
const SM_FAKE_TRIPLE = [
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "        ^^          " // 無理のない2連
];

// 複雑なブロック地帯（でも階段状）
const SM_COMPLEX = [
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "             ###    ",
    "        ###  ###    ",
    "   ###  ###  ###    ",
    "   ###  ###  ###    ",
    "   ###  ###  ###    "
];

// 穴あき（落下防止床あり）
const SM_GAP = [
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "                    ",
    "####            ####",
    "####     ^^     ####",
    "####    ####    ####", // 落ちても死なない（トゲはあるけど）
    "####    ####    ####"
];

const GOAL = [ "     G    ", "     G    ", "     G    ", "     G    ", "     G    ", "     G    ", "     G    ", "     G    ", "     G    ", "     G    ", "     G    ", "     G    ", "     G    ", "##########" ];


// ---------------------------------------------------------
// LEVEL BUILDER
// ---------------------------------------------------------

function getLevelMap(levelIndex) {
    let parts = [];
    parts.push(FLAT, FLAT); // スタートの助走

    if (levelIndex === 1) {
        // --- LEVEL 1: STEREO MADNESS RECREATION ---
        
        // Intro (0:00 - 0:10)
        parts.push(SM_INTRO_1, FLAT);
        parts.push(SM_INTRO_2, FLAT);
        parts.push(SM_STAIRS, FLAT); // 階段
        
        // Pillars & Jumps (0:10 - 0:24)
        parts.push(SM_PILLARS, FLAT);
        parts.push(SM_BLOCKS, FLAT);
        parts.push(SM_PRE_SHIP, FLAT); // 飛行船へ

        // Ship Part (0:24 - 0:38)
        parts.push(P_SHIP, FLAT);
        parts.push(SM_SHIP_1, SM_SHIP_2);
        parts.push(SM_SHIP_GATE, SM_SHIP_1);
        parts.push(P_CUBE, FLAT);

        // Red Section (0:38 - End)
        parts.push(SM_BLOCKS, SM_FAKE_TRIPLE);
        parts.push(SM_COMPLEX, SM_GAP);
        parts.push(SM_STAIRS, SM_INTRO_2);
        
        parts.push(FLAT, GOAL);

    } else if (levelIndex === 2) {
        // --- LEVEL 2: BACK ON TRACK STYLE ---
        // ジャンプパッド多め
        parts.push(SM_INTRO_2, SM_PRE_SHIP, FLAT);
        parts.push(SM_STAIRS, SM_GAP, SM_PILLARS);
        
        parts.push(P_SHIP, FLAT);
        parts.push(SM_SHIP_2, SM_SHIP_GATE, SM_SHIP_2);
        parts.push(P_CUBE, FLAT);

        parts.push(SM_BLOCKS, SM_PRE_SHIP, GOAL);

    } else {
        // --- LEVEL 3: CHALLENGE ---
        // 長めの構成
        parts.push(SM_STAIRS, SM_PILLARS, SM_GAP);
        parts.push(SM_BLOCKS, SM_FAKE_TRIPLE, SM_INTRO_2);
        
        parts.push(P_SHIP, FLAT);
        parts.push(SM_SHIP_GATE, SM_SHIP_2, SM_SHIP_GATE, SM_SHIP_1);
        
        parts.push(P_CUBE, FLAT);
        parts.push(SM_COMPLEX, SM_GAP, SM_PRE_SHIP, GOAL);
    }

    return joinChunks(parts);
}