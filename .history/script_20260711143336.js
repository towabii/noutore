// ===============================================
// ▲▲▲ 設定 ▲▲▲
// ===============================================
// フィードバック送信用のみに使用
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzJSO_Bq80Qc1UI8RNyKBJ2Az81QfFkqdO-0j9nLglrEkirg-69sxYfPdGMbq9l30AO/exec';

// --- 静的データ ---
const updateHistory = [
    { date: "2026/02/14", title: "サイトリニューアル", details: ["デザインを一新しました", "高速化を行いました"] },
    { date: "2026/02/10", title: "新作アプリ追加", details: ["ブロック落としを追加しました"] }
];

const scheduleData = [
    { date: "2026/02/20", name: "大型アップデート" },
    { date: "2026/03/01", name: "新ゲーム公開予定" }
];

// アイテムリスト
const items = [
    // --- Fun (Games) ---
    { title: "2D鬼ごっこ", description: "5人まで一緒に対戦可能", thumbnail: "./apps/onigokko/image.png", url: "./apps/onigokko/index.html", recommend: "BEST", category: "fun" },
    { title: "ブロック落とし", description: "CPUと対戦できるブロック落とし！", thumbnail: "./apps/app10/thumbnail.jpeg", url: "play.html?game=./apps/app10/index.html", recommend: "BEST", category: "fun" },
    { title: "ブロックトレーニング", description: "同じ色のブロックをそろえて消そう！", thumbnail: "./apps/app2/thumbnail.png", url: "play.html?game=./apps/app2/index.html", recommend: "人気", category: "fun" },
    { title: "17番出口", description: "不思議な地下通路を探索する作品。", thumbnail: "./apps/app8/thumbnail.png", url: "play.html?game=./apps/app8/index.html", recommend: "Beta", category: "fun" },
    { title: "Meta Dash", description: "リズムに合わせてジャンプ！", thumbnail: "./apps/app5/thumbnail.png", url: "play.html?game=./apps/app5/選択.html", recommend: null, category: "fun" },
    { title: "果物集め", description: "大きな果物を作ろう！", thumbnail: "./apps/app3/thumbnail.png", url: "play.html?game=./apps/app3/index.html", recommend: null, category: "fun" },
    { title: "待ち針のやつ", description: "回転する円に針を刺していくやつ。", thumbnail: "./apps/app6/thumbnail.png", url: "play.html?game=./apps/app6/index.html", recommend: null, category: "fun" },
    { title: "ボール移動", description: "意外と人気！！", thumbnail: "./apps/app4/thumbnail.png", url: "play.html?game=./apps/app4/index.html", recommend: null, category: "fun" },
    { title: "ボールコロコロ", description: "楽しい", thumbnail: "./apps/appボール/thumbnail.jpeg", url: "play.html?game=./apps/appボール/index.html", recommend: null, category: "fun" },
    
    // WIP (Work In Progress) - fun

    // --- Study ---
    { title: "学習プランナー Pro", description: "提出物の期限を管理できるカレンダー。", thumbnail: "./apps/外部URL用写真/学習.png", url: "play.html?game=./apps/TODO/index.html", recommend: "便利", category: "study" },

    // --- Other (Tools & Admin) ---
    { title: "My Wallet", description: "初の本格ウェブアプリ。", thumbnail: "./apps/外部URL用写真/マイウォレット.png", url: "https://towabii.github.io/mywallet/", recommend: "PWA", category: "other" },
    { title: "管理パネル", description: "開発者のみアクセス。", thumbnail: "./apps/外部URL用写真/NOIMAGE.jpeg", url: "https://towabii.github.io/kanri/", recommend: "ADMIN", category: "other" },
    { title: "BOX検索", description: "開発者のみアクセス。", thumbnail: "./apps/外部URL用写真/NOIMAGE.jpeg", url: "https://towabii.github.io/SmartBOX/", recommend: "ADMIN", category: "other" },
];

// お気に入り管理用配列
let favorites = JSON.parse(localStorage.getItem('toway-favorites')) || [];
let currentCategory = 'fun';

document.addEventListener('DOMContentLoaded', async function() {
    
    // ロード画面
    setTimeout(() => {
        document.getElementById('loader').classList.add('fade-out');
    }, 800); 

    // テーマ設定
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.dataset.theme = savedTheme;
    const themeToggle = document.getElementById('theme-toggle');
    if(themeToggle) themeToggle.checked = (savedTheme === 'dark'); 

    // クッキーバナー
    if (!localStorage.getItem('cookieAccepted')) {
        const banner = document.getElementById('cookie-banner');
        banner.classList.remove('hidden');
        document.getElementById('cookie-accept').onclick = () => {
            localStorage.setItem('cookieAccepted', 'true');
            banner.classList.add('hidden');
        };
    }

    // 初期化
    generateItemCards();
    applyFilter('fun');

    // --- 関数 ---

    function generateItemCards() {
        const container = document.getElementById('item-grid');
        if(!container) return;
        container.innerHTML = '';

        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.dataset.id = index;
            card.dataset.category = item.category;
            card.dataset.title = item.title.toLowerCase();
            card.dataset.desc = item.description.toLowerCase();

            // お気に入り状態の判定
            const isFav = favorites.includes(item.title);

            // バッジHTMLの生成
            let badgeHTML = '';
            if (item.recommend) {
                let badgeClass = 'badge-normal';
                if (item.recommend === 'BEST') badgeClass = 'badge-best';
                if (item.recommend === 'ADMIN') badgeClass = 'badge-admin';
                badgeHTML = `<span class="card-badge ${badgeClass}">${item.recommend}</span>`;
            }

            const imgHTML = `<img src="${item.thumbnail}" class="card-img" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'no-img\\'>NO IMAGE</div>'">`;
            
            // クールな常時表示タイトル＋ホバーで説明が浮き出るレイアウトへリニューアル
            card.innerHTML = `
                <div class="card-img-wrapper">${imgHTML}</div>
                ${badgeHTML}
                <button class="card-fav-bubble ${isFav ? 'active' : ''}" data-title="${item.title}">
                    <svg fill="${isFav ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                </button>
                <div class="card-info-bar">
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-short-desc">${item.description}</p>
                </div>
            `;
            container.appendChild(card);
        });

        // カード内のお気に入りクイッククリックイベント
        document.querySelectorAll('.card-fav-bubble').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // 詳細モーダルが開くのを防ぐ
                const title = btn.dataset.title;
                toggleFavorite(title);
                generateItemCards(); // 再描画して状態を同期
                applyFilter(currentCategory); // フィルターを再適用
            });
        });
    }

    // お気に入りの切り替えロジック
    function toggleFavorite(title) {
        if (favorites.includes(title)) {
            favorites = favorites.filter(f => f !== title);
            showToast("お気に入りから削除しました");
        } else {
            favorites.push(title);
            showToast("お気に入りに追加しました！⭐");
        }
        localStorage.setItem('toway-favorites', JSON.stringify(favorites));
    }

    function applyFilter(category) {
        currentCategory = category;
        document.querySelectorAll('.pill-btn[data-category]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        const query = document.getElementById('search-input').value.toLowerCase();
        const allCards = document.getElementById('item-grid').children;

        Array.from(allCards).forEach(card => {
            const itemCat = card.dataset.category;
            const itemTitle = card.dataset.title;
            const itemDesc = card.dataset.desc;
            const itemRealTitle = items[card.dataset.id].title;

            // カテゴリの一致判定（お気に入りフィルター対応）
            let matchCat = false;
            if (category === 'all') matchCat = true;
            else if (category === 'favorite') matchCat = favorites.includes(itemRealTitle);
            else matchCat = (itemCat === category);

            // 検索ワードの一致判定
            const matchSearch = itemTitle.includes(query) || itemDesc.includes(query);

            if (matchCat && matchSearch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // カテゴリフィルタークリック
    document.querySelectorAll('.pill-btn[data-category]').forEach(btn => {
        btn.addEventListener('click', () => applyFilter(btn.dataset.category));
    });

    // リアルタイム検索のイベントリスナー
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => applyFilter(currentCategory));
    }

    // ナビゲーション（PC用・モバイル用共通ロジックへリニューアル）
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(`content-${target}`).classList.add('active');
            
            // 全てのナビボタンのactiveを一度外して、同じターゲットのものをアクティブにする
            document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(b => {
                b.classList.toggle('active', b.dataset.target === target);
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // モーダル
    function openModal(id) {
        document.getElementById(id).classList.add('visible');
        document.body.classList.add('no-scroll');
    }
    function closeModal(el) {
        el.closest('.modal-overlay').classList.remove('visible');
        document.body.classList.remove('no-scroll');
    }
    document.querySelectorAll('[data-close-modal]').forEach(btn => btn.onclick = (e) => closeModal(e.target));
    document.querySelectorAll('.modal-overlay').forEach(m => m.onclick = (e) => { if(e.target === m) closeModal(m); });

    // 詳細モーダル展開
    document.getElementById('item-grid').addEventListener('click', (e) => {
        const card = e.target.closest('.game-card');
        if(!card) return;
        const item = items[card.dataset.id];

        if(item.url === '#') {
            showToast("🚧 現在開発中です");
            return;
        }

        document.getElementById('details-modal-title').textContent = item.title;
        document.getElementById('details-modal-desc').textContent = item.description;
        
        // モーダル内のバッジ処理
        const modalBadge = document.getElementById('details-modal-badge');
        if(item.recommend) {
            modalBadge.textContent = item.recommend;
            modalBadge.style.display = 'inline-block';
        } else {
            modalBadge.style.display = 'none';
        }

        const img = document.getElementById('details-modal-img');
        img.src = item.thumbnail;
        img.style.display = 'block';
        img.onerror = () => { img.style.display='none'; };

        const launch = document.getElementById('details-modal-launch-btn');
        launch.href = item.url;

        // モーダル内のお気に入りボタン状態更新
        const favBtn = document.getElementById('details-modal-fav-btn');
        const updateFavBtnStyle = () => {
            const isFav = favorites.includes(item.title);
            favBtn.classList.toggle('active', isFav);
            favBtn.querySelector('svg').setAttribute('fill', isFav ? 'currentColor' : 'none');
        };
        updateFavBtnStyle();

        favBtn.onclick = () => {
            toggleFavorite(item.title);
            updateFavBtnStyle();
            generateItemCards(); // 背景のカード状態を同期
            applyFilter(currentCategory);
        };
        
        document.getElementById('details-modal-share-btn').onclick = () => {
            document.getElementById('share-url-input').value = new URL(item.url, location.href).href;
            openModal('share-modal');
        };

        openModal('details-modal');
    });

    // フッターのヘルプ・プライバシーセンターボタン
    document.getElementById('footer-help-btn').onclick = () => {
        const sel = document.getElementById('fb-game');
        sel.innerHTML = '<option value="-">特になし</option>';
        items.forEach(i => {
            const op = document.createElement('option');
            op.value = i.title; op.textContent = i.title;
            sel.appendChild(op);
        });
        openModal('help-modal');
    };

    // フォーム送信
    const fbForm = document.getElementById('feedback-form');
    fbForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('fb-submit-btn');
        btn.disabled = true; btn.textContent = "送信中...";
        
        // ユーザーID取得
        let userId = localStorage.getItem('toway-user-id');
        if (!userId) {
            userId = 'u-' + Math.random().toString(36).substring(2, 10);
            localStorage.setItem('toway-user-id', userId);
        }

        try {
            await fetch(GAS_URL, {
                method: 'POST', body: JSON.stringify({
                    action: 'submitFeedback',
                    payload: {
                        userId: userId,
                        name: document.getElementById('fb-name').value,
                        type: document.getElementById('fb-type').value,
                        game: document.getElementById('fb-game').value,
                        content: document.getElementById('fb-content').value
                    }
                })
            });
            showToast("送信しました！");
            closeModal(document.getElementById('help-modal'));
            fbForm.reset();
        } catch(e) {
            showToast("送信しました！(オフライン)");
            closeModal(document.getElementById('help-modal'));
            fbForm.reset();
        } finally {
            btn.disabled = false; btn.textContent = "送信";
        }
    });

    // その他テーマ切り替え
    document.getElementById('theme-toggle').addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.body.dataset.theme = theme;
        localStorage.setItem('theme', theme);
    });

    document.getElementById('copy-url-btn').onclick = () => {
        navigator.clipboard.writeText(document.getElementById('share-url-input').value);
        showToast("コピーしました");
    };

    // 更新履歴・予定表
    document.getElementById('show-update-info-btn').onclick = () => {
        const html = updateHistory.map(u => `<div class="info-item"><b>${u.date}</b>: ${u.title}<br><small>${u.details.join(', ')}</small></div>`).join('') || '履歴なし';
        document.getElementById('info-modal-title').textContent = '更新履歴';
        document.getElementById('info-modal-content').innerHTML = html;
        openModal('info-modal');
    };
    
    document.getElementById('show-schedule-btn').onclick = () => {
        const html = scheduleData.map(s => `<div class="info-item"><b>${s.date}</b>: ${s.name}</div>`).join('') || '予定なし';
        document.getElementById('info-modal-title').textContent = '今後の予定';
        document.getElementById('info-modal-content').innerHTML = html;
        openModal('info-modal');
    };

    // 情報モーダルバインド
    const bindInfoModal = (btnId, title, contentHTML) => {
        const btn = document.getElementById(btnId);
        if(btn) btn.onclick = (e) => {
            e.preventDefault();
            document.getElementById('info-modal-title').textContent = title;
            document.getElementById('info-modal-content').innerHTML = contentHTML;
            openModal('info-modal');
        };
    };

    // 本格的な法的テキスト
    const termsText = `
        <div style="font-size:0.95rem; line-height:1.7;">
            <h4 style="color:var(--primary);">第1条（適用）</h4>
            <p>本利用規約は、当サイトの利用条件を定めるものです。利用者は、本規約に同意した上で当サイトを利用するものとします。</p>
            <h4 style="color:var(--primary);">第2条（禁止事項）</h4>
            <p>利用者は、以下の行為を行ってはなりません。</p>
            <ul>
                <li>法令または公序良俗に違反する行為</li>
                <li>当サイトのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                <li>当サイトのサービスの運営を妨害するおそれのある行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            </ul>
            <h4 style="color:var(--primary);">第3条（免責事項）</h4>
            <p>当サイトの利用により生じたいかなる損害（PCの不具合、学校での指導、成績への影響等）についても、運営者は一切の責任を負いません。自己責任でご利用ください。</p>
            <h4 style="color:var(--primary);">第4条（著作権）</h4>
            <p>当サイトのコンテンツ（文章、画像、プログラム等）の著作権は、TOWAに帰属します。無断転載を禁じます。</p>
        </div>
    `;

    const privacyText = `
        <div style="font-size:0.95rem; line-height:1.7;">
            <h4 style="color:var(--primary);">1. 情報の取得</h4>
            <p>当サイトでは、アクセス解析ツールを使用しています。これらはデータの収集のためにCookieを使用することがあります。</p>
            <h4 style="color:var(--primary);">2. 個人情報の利用目的</h4>
            <p>お問い合わせフォームから取得したお名前やメールアドレス等の個人情報は、お問い合わせへの対応のみに利用し、第三者に提供することはありません。</p>
        </div>
    `;

    const personalInfoText = `
        <div style="font-size:0.95rem; line-height:1.7;">
            <p>当サイトでは、お問い合わせ時に入力いただいた個人情報（お名前、IPアドレス等）を厳重に管理し、不正アクセス、紛失、漏洩等が起きないよう安全対策を講じます。</p>
            <p>法的機関からの開示請求があった場合を除き、ご本人の同意なく第三者に提供することはありません。</p>
        </div>
    `;

    const compatibilityText = `
        <div style="font-size:0.95rem; line-height:1.7;">
            <h4 style="color:var(--primary);">推奨ブラウザ</h4>
            <p>Google Chrome 最新版<br>Microsoft Edge 最新版<br>Safari 最新版</p>
            <h4 style="color:var(--primary);">推奨デバイス</h4>
            <p>PC（Windows / Mac / Chromebook）での利用を強く推奨します。<br>スマートフォン・タブレットでも閲覧可能ですが、一部のゲームはキーボード操作が必要なため動作しない場合があります。</p>
        </div>
    `;

    bindInfoModal('open-terms-btn', '利用規約', termsText);
    bindInfoModal('open-privacy-btn', 'プライバシーポリシー', privacyText);
    bindInfoModal('open-personal-info-btn', '個人情報の取り扱い', personalInfoText);
    bindInfoModal('open-compatibility-btn', '対応機種', compatibilityText);

    function showToast(msg) {
        const t = document.getElementById('toast-notification');
        t.textContent = msg; t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    }
});