// ゲームリスト (Poki風サイドバー用 - 本体のscript.jsと同じ内容を参照)
const games = [
    { title: "ブロック落とし", src: "./apps/app10/index.html", thumb: "./apps/app10/thumbnail.jpeg" },
    { title: "ブロックトレーニング", src: "./apps/app2/index.html", thumb: "./apps/app2/thumbnail.png" },
    { title: "17番出口", src: "./apps/app8/index.html", thumb: "./apps/app8/thumbnail.png" },
    { title: "Meta Dash", src: "./apps/app5/選択.html", thumb: "./apps/app5/thumbnail.png" },
    { title: "StudyConnect", src: "./apps/スタディーコネクト/紹介.html", thumb: "./apps/スタディーコネクト/thumbnail.png" },
    { title: "果物集め", src: "./apps/app3/index.html", thumb: "./apps/app3/thumbnail.png" },
    { title: "待ち針のやつ", src: "./apps/app6/index.html", thumb: "./apps/app6/thumbnail.png" },
    { title: "ボール移動", src: "./apps/app4/index.html", thumb: "./apps/app4/thumbnail.png" },
    { title: "ボールコロコロ", src: "./apps/appボール/index.html", thumb: "./apps/appボール/thumbnail.jpeg" },
    { title: "街づくり", src: "./apps/appctyi/index.html", thumb: "./apps/appctyi/thumbnail.png" }
];

document.addEventListener('DOMContentLoaded', () => {
    // URLパラメータからゲームを取得 (?game=...)
    const params = new URLSearchParams(window.location.search);
    let gameSrc = params.get('game');
    
    // ゲームリストからタイトル検索してメタデータ取得
    const currentGame = games.find(g => g.src === gameSrc) || { title: "ゲーム", src: gameSrc };
    
    if (gameSrc) {
        document.getElementById('game-iframe').src = gameSrc;
        document.getElementById('game-title').textContent = currentGame.title;
        document.title = `${currentGame.title} - Toway`;
    } else {
        document.getElementById('game-title').textContent = "ゲームを選択してください";
    }

    // 関連ゲーム生成
    const sidebar = document.getElementById('related-games-container');
    games.forEach(g => {
        if (g.src === gameSrc) return; // 自分自身は除外
        const link = document.createElement('a');
        link.className = 'related-game';
        link.href = `play.html?game=${encodeURIComponent(g.src)}`;
        link.title = g.title;
        link.innerHTML = `<img src="${g.thumb}" alt="${g.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMzMzIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIvPjwvc3ZnPg=='">`;
        sidebar.appendChild(link);
    });

    // ゲームリロード関数 (サイズ変更時用)
    function reloadGameFrame() {
        const iframe = document.getElementById('game-iframe');
        if(iframe) {
            setTimeout(() => {
                iframe.src = iframe.src;
            }, 100);
        }
    }

    // サイト内全画面表示 (シアターモード)
    const fsBtn = document.getElementById('fullscreen-btn');
    const exitFsBtn = document.getElementById('exit-fullscreen-btn');
    const wrapper = document.getElementById('main-game-wrapper');
    
    function toggleFullscreen() {
        wrapper.classList.toggle('expanded');
        reloadGameFrame();
    }

    // 全画面ボタンクリック
    fsBtn.addEventListener('click', toggleFullscreen);
    
    // 左下ホバーエリア内の終了ボタンクリック
    exitFsBtn.addEventListener('click', () => {
        if (wrapper.classList.contains('expanded')) {
            wrapper.classList.remove('expanded');
            reloadGameFrame();
        }
    });

    // ESCキー2回押し判定用
    let lastEscPressTime = 0;

    // キーボードショートカット制御
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const now = Date.now();
            // 500ms以内に2回押されたかチェック
            if (now - lastEscPressTime <= 500) {
                // Esc×2 で全画面解除
                if (wrapper.classList.contains('expanded')) {
                    wrapper.classList.remove('expanded');
                    reloadGameFrame();
                }
                lastEscPressTime = 0; // リセット
            } else {
                // Esc単押し時の処理 (広告を閉じるなど)
                if(document.getElementById('ad-overlay').classList.contains('visible')) {
                    closeAd();
                }
                lastEscPressTime = now;
            }
        }
    });

    // ブラウザの全画面切り替え検知 (念のため)
    document.addEventListener('fullscreenchange', () => {
        reloadGameFrame();
    });

    // 広告制御
    const adOverlay = document.getElementById('ad-overlay');
    const closeAdBtn = document.getElementById('close-ad-btn');

    // 外部から呼べるようにGlobalにする
    window.triggerGameOverAd = function() {
        adOverlay.classList.remove('hidden');
        setTimeout(() => adOverlay.classList.add('visible'), 10);
    };

    function closeAd() {
        adOverlay.classList.remove('visible');
        setTimeout(() => adOverlay.classList.add('hidden'), 300);
        document.getElementById('game-iframe').focus();
    }

    closeAdBtn.addEventListener('click', closeAd);

    // postMessage受信 (ゲームからの通知)
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'GAME_OVER') {
            triggerGameOverAd();
        }
    });

    // モーダル制御
    window.openModal = (id) => {
        const m = document.getElementById(id);
        m.classList.remove('hidden');
        setTimeout(() => m.classList.add('visible'), 10);
    };
    window.closeModal = (id) => {
        const m = document.getElementById(id);
        m.classList.remove('visible');
        setTimeout(() => m.classList.add('hidden'), 300);
    };
});