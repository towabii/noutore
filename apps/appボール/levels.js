// levels.js

// レベル生成用の設定
const TOTAL_LEVELS = 50;

/**
 * レベルデータを生成する関数
 * type: 'normal' | 'no-rails' (壁なし) | 'narrow' (狭い道)
 * tilt: 傾き (正: 下り, 負: 上り)
 * obstacles: 障害物の数
 */
export const levels = [];

for (let i = 1; i <= TOTAL_LEVELS; i++) {
    const levelData = [];
    
    // 難易度係数 (0.0 ~ 1.0)
    const difficulty = i / TOTAL_LEVELS;
    
    // 1. スタート地点 (安全地帯)
    levelData.push({ length: 10, type: 'normal', tilt: 0, obstacles: 0 });

    // 2. メインコース生成 (レベルが高いほどセグメントが増える)
    const segmentsCount = 2 + Math.floor(i / 5); 

    for (let j = 0; j < segmentsCount; j++) {
        let segmentType = 'normal';
        let segmentTilt = 0;
        let obsCount = 0;

        // レベル5以上で壁なしエリア出現
        if (i > 5 && Math.random() < (0.2 + difficulty * 0.5)) {
            segmentType = 'no-rails';
        }

        // レベル10以上で坂道出現
        if (i > 10 && Math.random() < 0.4) {
            // -0.2(上り) 〜 0.2(下り)
            segmentTilt = (Math.random() * 0.4) - 0.2; 
        }

        // 障害物の数 (レベルに応じて増える)
        if (i > 3) {
            obsCount = Math.floor(Math.random() * (1 + difficulty * 3));
        }

        levelData.push({
            length: 10 + Math.random() * 5, // 10~15mの長さ
            type: segmentType,
            tilt: segmentTilt,
            obstacles: obsCount
        });
    }

    // 3. ゴール直前 (少し安全に)
    levelData.push({ length: 5, type: 'normal', tilt: 0, obstacles: 0 });

    levels.push(levelData);
}

// 特定のレベルを固定で面白くしたい場合はここで上書き可能
// 例: レベル1はチュートリアル
levels[0] = [
    { length: 10, type: 'normal', tilt: 0, obstacles: 0 },
    { length: 15, type: 'normal', tilt: 0, obstacles: 0 },
    { length: 10, type: 'no-rails', tilt: 0, obstacles: 0 }, // 落ちる練習
    { length: 5, type: 'normal', tilt: 0, obstacles: 0 }
];