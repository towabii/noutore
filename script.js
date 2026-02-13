// ===============================================
// ▲▲▲ 必ず設定してください ▲▲▲
// ===============================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzJSO_Bq80Qc1UI8RNyKBJ2Az81QfFkqdO-0j9nLglrEkirg-69sxYfPdGMbq9l30AO/exec';

// データ定義
let notificationData = { title: "", text: "", active: false };
let updateInfoData = { history: [], future: [] };
let scheduleData = [];
let surveyData = { id: "default_survey", question: "", options: [] };

// アイテムリスト
const items = [
    { title: "ブロック落とし", description: "CPUと対戦できるブロック落とし！", thumbnail: "./apps/app10/thumbnail.jpeg", url: "./apps/app10/index.html", recommend: "BEST", category: "fun" },
    { title: "ブロックトレーニング", description: "同じ色のブロックをそろえて消そう！", thumbnail: "./apps/app2/thumbnail.png", url: "./apps/app2/index.html", recommend: "人気", category: "fun" },
    { title: "17番出口", description: "不思議な地下通路を探索する作品。", thumbnail: "./apps/app8/thumbnail.png", url: "./apps/app8/index.html", recommend: "Beta", category: "fun" },
    { title: "Meta Dash", description: "リズムに合わせてジャンプ！", thumbnail: "./apps/app5/thumbnail.png", url: "./apps/app5/選択.html", recommend: null, category: "fun" },
    { title: "StudyConnect", description: "初のSNSアプリ", thumbnail: "./apps/スタディーコネクト/thumbnail.png", url: "./apps/スタディーコネクト/紹介.html", recommend: null, category: "fun" },
    { title: "果物集め", description: "大きな果物を作ろう！", thumbnail: "./apps/app3/thumbnail.png", url: "./apps/app3/index.html", recommend: null, category: "fun" },   
    { title: "学習プランナー Pro", description: "提出物の期限を管理できるカレンダー。", thumbnail: "./apps/外部URL用写真/学習.png", url: "./apps/TODO/index.html", recommend: "便利", category: "study" },
    { title: "ちょっとGPT", description: "高性能な対話プログラムとおしゃべり。", thumbnail: "./apps/app9/thumbnail.png", url: "#", recommend: "調整中", category: "other" },
    { title: "待ち針のやつ", description: "回転する円に針を刺していくやつ。", thumbnail: "./apps/app6/thumbnail.png", url: "./apps/app6/index.html", recommend: null, category: "fun" },
    { title: "ボール移動", description: "意外と人気！！", thumbnail: "./apps/app4/thumbnail.png", url: "./apps/app4/index.html", recommend: null, category: "fun" },
    { title: "ボールコロコロ", description: "楽しい", thumbnail: "./apps/appボール/thumbnail.jpeg", url: "./apps/appボール/index.html", recommend: null, category: "fun" },
    { title: "3Dトレーニング", description: "三次元空間で頭を鍛える新しい体験。", thumbnail: "./apps/app7/thumbnail.jpeg", url: "#", recommend: "WIP", category: "fun" },
    { title: "砂ブロック落とし", description: "最近流行ってるあれ", thumbnail: "./apps/app12/thumbnail.jpeg", url: "#", recommend: "New", category: "fun" },
    { title: "ブロック崩し", description: "グーグルのねあれよあれ", thumbnail: "./apps/app13/thumbnail.jpeg", url: "#", recommend: "WIP", category: "fun" },
    { title: "パズルブロック", description: "まあ、楽しくない", thumbnail: "./apps/app14/thumbnail.jpeg", url: "#", recommend: null, category: "fun" },
    { title: "キャンディークリッカー", description: "暇つぶし", thumbnail: "./apps/app16/thumbnail.jpeg", url: "#", recommend: null, category: "fun" },
    { title: "街づくり", description: "大きな町を作ろう", thumbnail: "./apps/appcity/thumbnail.png", url: "./apps/appctyi/index.html", recommend: null, category: "fun" },
    { title: "My Wallet", description: "初の本格ウェブアプリ。", thumbnail: "./apps/外部URL用写真/マイウォレット.png", url: "https://towabii.github.io/mywallet/", recommend: "PWA", category: "other" },
    { title: "管理パネル", description: "開発者のみアクセス。", thumbnail: "./apps/外部URL用写真/NOIMAGE.jpeg", url: "https://towabii.github.io/kanri/", recommend: "ADMIN", category: "other" },
    { title: "BOX検索", description: "開発者のみアクセス。", thumbnail: "./apps/外部URL用写真/NOIMAGE.jpeg", url: "https://towabii.github.io/SmartBOX/", recommend: "ADMIN", category: "other" },
];

document.addEventListener('DOMContentLoaded', async function() {
    
    // --- 初期設定 ---
    const userId = getUserId();
    const clientId = Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
    document.getElementById('header-user-id').textContent = `ID: ${userId}`;
    
    // テーマ適用
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.dataset.theme = savedTheme;
    document.getElementById('theme-toggle').checked = (savedTheme === 'light');

    // UI初期描画
    generateItemCards(); 
    
    // 初期ロード時に「fun (Game)」カテゴリでフィルタリングを実行
    applyFilter('fun');

    // --- バックグラウンド処理 ---
    try {
        const [siteData, accessData] = await Promise.all([
            callGas('getSiteData'),
            callGas('accessStart', { userId, clientId })
        ]);

        if (accessData && accessData.status === 'BANNED') {
            showBanScreen(accessData.message);
            return;
        }

        if (siteData) {
            notificationData = {
                title: siteData.config.notificationTitle || "",
                text: siteData.config.notificationText || "",
                active: String(siteData.config.notificationActive).toLowerCase() === 'true'
            };
            scheduleData = siteData.schedule || [];
            updateInfoData.history = siteData.updates || [];
            surveyData = {
                id: siteData.config.surveyId || "s1",
                question: siteData.config.surveyQuestion || "",
                options: siteData.config.surveyOptions ? siteData.config.surveyOptions.split(',') : []
            };

            populateModals();
            
            if (accessData.message) showNotification("Admin Message", accessData.message);
            else if (notificationData.active) showNotification(notificationData.title, notificationData.text);
            
            checkAndShowSurvey();
        }

        updateOnlineCount();
        setInterval(updateOnlineCount, 60000);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) callGas('accessEnd', { userId, clientId }).catch(()=>{});
            else updateOnlineCount();
        });

    } catch (e) {
        console.warn("Init Warning:", e);
    }

    // --- 関数群 ---

    function getUserId() {
        let id = localStorage.getItem('toway-user-id');
        if (!id) {
            id = 'u-' + Math.random().toString(36).substring(2, 10);
            localStorage.setItem('toway-user-id', id);
        }
        return id;
    }

    async function callGas(action, payload = {}) {
        if (!GAS_URL) return null;
        try {
            const res = await fetch(GAS_URL, {
                method: 'POST', mode: 'cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action, payload })
            });
            const json = await res.json();
            return json.data;
        } catch (e) { return null; }
    }

    function generateItemCards() {
        const container = document.getElementById('item-list');
        container.innerHTML = '';
        
        const adInterval = 6; 
        
        items.forEach((item, index) => {
            if (index > 0 && index % adInterval === 0) {
                const adCard = document.createElement('div');
                adCard.className = 'ad-card-slot';
                adCard.dataset.category = 'all'; // 広告はすべてのカテゴリで表示可能とする
                adCard.innerHTML = `
                    <div class="ad-text">広告枠 [レクタングル]</div>
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-format="fluid"
                         data-ad-layout-key="-fb+5w+4e-db+86"
                         data-ad-client="ca-pub-4223622024416304"
                         data-ad-slot="GRID_SLOT_ID"></ins>
                    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
                `;
                container.appendChild(adCard);
            }

            const card = document.createElement('div');
            card.className = 'item-card';
            card.dataset.id = index;
            card.dataset.category = item.category;

            const imgTag = `<img src="${item.thumbnail}" alt="${item.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'no-image-placeholder\\'>NO IMAGE</div>'">`;
            const recommendBadge = item.recommend ? `<div class="recommend-tag">${item.recommend}</div>` : '';
            const ribbon = `<div class="ribbon ${item.category}">${item.category === 'fun' ? 'GAME' : item.category === 'study' ? 'STUDY' : 'TOOL'}</div>`;

            card.innerHTML = `
                ${recommendBadge}
                ${ribbon}
                <div class="thumb-area">${imgTag}</div>
                <div class="card-body">
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-desc">${item.description}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // フィルタリング処理
    function applyFilter(category) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        const cards = document.querySelectorAll('#item-list > div');
        cards.forEach(card => {
            if (card.classList.contains('ad-card-slot')) {
                card.style.display = 'flex';
            } else {
                const itemCat = card.dataset.category;
                if (category === 'all' || itemCat === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => applyFilter(btn.dataset.category));
    });

    // モーダル操作
    function openModal(id) {
        document.getElementById(id).classList.add('visible');
        document.body.classList.add('no-scroll');
    }
    function closeModal(el) {
        el.closest('.modal-overlay').classList.remove('visible');
        document.body.classList.remove('no-scroll');
    }
    document.querySelectorAll('[data-close-modal]').forEach(b => b.onclick = (e) => closeModal(e.target));
    document.querySelectorAll('.modal-overlay').forEach(m => m.onclick = (e) => { if (e.target === m && m.id !== 'ban-screen') closeModal(m); });

    document.getElementById('item-list').addEventListener('click', (e) => {
        const card = e.target.closest('.item-card');
        if (!card) return;
        const item = items[card.dataset.id];
        
        if (item.url === '#') {
            showToast("現在開発中です 🚧");
            return;
        }

        document.getElementById('details-modal-title').textContent = item.title;
        const imgEl = document.getElementById('details-modal-img');
        imgEl.src = item.thumbnail;
        imgEl.style.display = 'block';
        imgEl.onerror = function() {
             this.style.display = 'none';
             this.parentElement.innerHTML = '<div class="no-image-placeholder">NO IMAGE</div>';
        }

        document.getElementById('details-modal-desc').textContent = item.description;
        const launch = document.getElementById('details-modal-launch-btn');
        launch.href = item.url;
        launch.onclick = () => callGas('logGamePlay', { userId, gameTitle: item.title }).catch(()=>{});
        
        document.getElementById('details-modal-share-btn').onclick = () => {
            openShareModal(item.title, new URL(item.url, location.href).href);
        };
        
        openModal('details-modal');
    });

    function openShareModal(title, url) {
        document.getElementById('share-url-input').value = url;
        const qrBox = document.getElementById('qrcode');
        qrBox.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
            QRCode.toCanvas(url, { width: 180, margin: 2 }, (err, cvs) => {
                if (!err) qrBox.appendChild(cvs);
            });
        }
        openModal('share-modal');
    }
    document.getElementById('copy-url-btn').onclick = (e) => {
        navigator.clipboard.writeText(document.getElementById('share-url-input').value);
        e.target.textContent = "Copied!";
        setTimeout(() => e.target.textContent = "コピー", 2000);
    };

    document.getElementById('open-feedback-btn').onclick = (e) => {
        e.preventDefault();
        document.getElementById('fb-userid').value = userId;
        const gameSel = document.getElementById('fb-game');
        gameSel.innerHTML = '<option value="-">特になし</option>';
        items.forEach(i => {
            const op = document.createElement('option');
            op.value = i.title; op.textContent = i.title;
            gameSel.appendChild(op);
        });
        openModal('feedback-modal');
    };
    
    document.querySelectorAll('#fb-rating span').forEach(s => {
        s.onclick = () => {
            const v = s.dataset.value;
            document.getElementById('fb-rating-value').value = v;
            document.querySelectorAll('#fb-rating span').forEach(st => {
                st.classList.toggle('active', st.dataset.value <= v);
            });
        };
    });

    // フィードバック送信処理
    const fbForm = document.getElementById('feedback-form');
    fbForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('fb-submit-btn');
        const originalText = btn.textContent;
        btn.textContent = "送信中..."; 
        btn.disabled = true;
        
        try {
            const data = {
                userId: document.getElementById('fb-userid').value,
                name: document.getElementById('fb-name').value,
                type: document.getElementById('fb-type').value,
                game: document.getElementById('fb-game').value,
                rating: document.getElementById('fb-rating-value').value,
                banAppeal: document.getElementById('fb-ban-appeal').checked,
                content: document.getElementById('fb-content').value
            };
            
            await callGas('submitFeedback', data);
            
            showToast("意見を送信しました！");
            closeModal(document.getElementById('feedback-modal'));
            fbForm.reset();
            document.querySelectorAll('#fb-rating span').forEach(s=>s.classList.add('active'));
            document.getElementById('fb-rating-value').value = 5;

        } catch(err) {
            console.error(err);
            alert("送信に失敗しました。");
        } finally {
            btn.textContent = originalText; 
            btn.disabled = false;
        }
    });

    document.getElementById('theme-toggle').onchange = (e) => {
        const t = e.target.checked ? 'light' : 'dark';
        document.body.dataset.theme = t;
        localStorage.setItem('theme', t);
    };

    document.getElementById('show-update-info-btn').onclick = () => openModal('update-info-modal');
    document.getElementById('show-schedule-btn').onclick = () => openModal('schedule-modal');

    function populateModals() {
        const uBox = document.getElementById('update-info-content');
        uBox.innerHTML = updateInfoData.history.map(u => `
            <div style="border-left: 2px solid var(--primary); padding-left: 1rem; margin-bottom: 2rem;">
                <div style="color:var(--text-muted); font-size:0.8rem;">${u.date} <span style="background:var(--primary); color:#fff; padding:2px 6px; border-radius:4px;">${u.version}</span></div>
                <h3 style="margin:5px 0;">${u.title}</h3>
                <ul style="padding-left: 1.2rem; color: var(--text-muted);">${u.details.map(d=>`<li>${d}</li>`).join('')}</ul>
            </div>
        `).join('');

        const sBox = document.getElementById('schedule-list');
        sBox.innerHTML = scheduleData.map(s => `
            <li style="display:flex; justify-content:space-between; padding: 10px 0; border-bottom:1px dashed var(--border);">
                <span>${s.name}</span> <span style="color:var(--primary); font-weight:bold;">${s.date}</span>
            </li>
        `).join('');
    }

    async function updateOnlineCount() {
        const d = await callGas('getOnlineCount');
        if (d) document.getElementById('online-count-display').textContent = `${d.onlineCount} Online`;
    }

    function showBanScreen(msg) {
        document.getElementById('ban-user-id-display').textContent = userId;
        document.getElementById('ban-admin-message').textContent = msg || "なし";
        document.getElementById('ban-screen').classList.add('visible');
        document.body.classList.add('no-scroll');
        document.getElementById('site-wrapper').style.display = 'none';
        
        document.getElementById('ban-feedback-btn').onclick = () => {
            document.getElementById('fb-ban-appeal').checked = true;
            openModal('feedback-modal');
        };
    }

    function showToast(msg) {
        const t = document.getElementById('toast-notification');
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    }
    
    function showNotification(title, text) {
        document.getElementById('notification-title').textContent = title;
        document.getElementById('notification-text').innerHTML = text;
        openModal('notification-modal');
    }

    function checkAndShowSurvey() {
        if (!surveyData.question) return;
        if (localStorage.getItem('ans_' + surveyData.id)) return;
        
        document.getElementById('survey-question').textContent = surveyData.question;
        const box = document.getElementById('survey-options-container');
        box.innerHTML = '';
        surveyData.options.forEach(op => {
            const b = document.createElement('button');
            b.className = 'btn ghost';
            b.style.width = '100%'; b.style.marginBottom = '8px';
            b.textContent = op;
            b.onclick = () => {
                callGas('submitSurvey', { userId, surveyId: surveyData.id, answer: op });
                localStorage.setItem('ans_' + surveyData.id, '1');
                closeModal(document.getElementById('survey-modal'));
                showToast("回答しました");
            };
            box.appendChild(b);
        });
        setTimeout(() => openModal('survey-modal'), 2000);
    }

    document.addEventListener('keydown', (e) => {
        if (!e.target.closest('input,textarea') && e.key === 'Enter') {
            document.getElementById('fake-translator').classList.toggle('hidden');
        }
    });
    const tIn = document.getElementById('translator-input');
    const tOut = document.getElementById('translator-output');
    tIn.addEventListener('input', () => {
        tOut.value = tIn.value.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 1)).join('');
    });

    document.querySelectorAll('nav a').forEach(link => {
        link.onclick = (e) => {
            if (link.id === 'open-feedback-btn') return;
            e.preventDefault();
            document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(`content-${link.dataset.target}`).classList.add('active');
        };
    });
});
