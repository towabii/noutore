// ===============================================
// ▲▲▲ 必ず設定してください ▲▲▲
// ===============================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyU27oTz6Nt65kkF7nLu_r9KSFiCZP0CqwvTzlCBcegweEcvs65W2Wco_NKcX3G9k1_/exec';
// ===============================================

// ===============================================
// 簡単更新エリア
// ここの情報を書き換えるだけでサイトに反映されます
// ===============================================

// 「お知らせ」の内容
const notificationData = {
    title: "【重要】ちょっとGPT有料化について",
    text: "これまで無料で提供予定だった当AIサービスですが、運営体制の都合により、#月額制の有料サービスとして提供することになりました。#突然の変更となり申し訳ございません。<br>ライトプラン：月額 80円<br><br>スタンダードプラン：月額 110円<br><br>プレミアムプラン：月額 250円<br><br>できるだけ安く提供できるよう赤字覚悟でやっております。何卒よろしくお願いいたします。<br>",
    closeDelaySeconds: 0, // お知らせを閉じられるようになるまでの秒数
    showOncePerDay: false // true: 1日1回だけ表示, false: 毎回表示
};

// 「アップデート情報」の内容
const updateInfoData = {
    // 複数のアップデートタイトルを配列で管理します
    titles: [
        "ブロック落としにCPU(人工知能)が追加！",
        "中間テストまでの日にち、とわの誕生日までの日にちが追加！",
        "とわの仕事(8件)が終わるまでアプデはありません。"
    ],
    video: "cpu.mp4", // 表示する動画ファイル名
    futureUpdates: [
        "ブロックトレーニングにCPUを追加予定",
        "果物集めにもCPUを追加予定",
        "リンゴクリッカーを追加予定"
    ] // 今後のアップデート予定 (必要なだけ追加・削除できます)
};

// 「実装予定日一覧」の内容
const scheduleData = [
    { name: "ジオメタリートレーニング", date: "10月23日" },
    { name: "3Dトレーニング", date: "11月7日" },
    { name: "ちょっとGPT", date: "11月30日" },
    { name: "7番出口", date: "12月25日" },
    { name: "リンゴクリッカー", date: "10月11日" },
    { name: "時計", date: "明日" }
]; // { name: "ゲーム名", date: "日付" } の形式で追加・削除できます

// ===============================================
// 簡単更新エリアここまで
// ===============================================


const items = [
  {
    title: "ブロック落とし",
    description: "CPUと対戦できるブロック落とし！あなたは勝てるか！？",
    thumbnail: "./apps/app10/thumbnail.jpeg",
    url: "./apps/app10/index.html",
    recommend: "一番頑張った泣"
  },
  {
    title: "ブロックトレーニング",
    description: "同じ色のブロックをそろえて消そう！連鎖が気持ちいい！",
    thumbnail: "./apps/app2/thumbnail.png",
    url: "./apps/app2/index.html",
    recommend: "一番人気！"
  },
  {
    title: "果物集め",
    description: "スイカのあれ",
    thumbnail: "./apps/app3/thumbnail.png", 
    url: "./apps/app3/index.html",
    recommend: null
  },
  {
    title: "ボール移動",
    description: "多分一番人気ないかな(^▽^)",
    thumbnail: "./apps/app4/thumbnail.png", 
    url: "./apps/app4/index.html",
    recommend: "最低人気の予定！"
  },
  {
    title: "ジオメタリートレーニング",
    description: "なつかしいね。ちな、BETA版ねバグおおいよ",
    thumbnail: "./apps/app5/thumbnail.png", 
    url: "./apps/app5/index.html",
    recommend: "バグ多い！早期アクセスバージョン"
  },
  {
    title: "待ち針のやつ",
    description: "地味に楽しいよ",
    thumbnail: "./apps/app6/thumbnail.png", 
    url: "./apps/app6/index.html",
    recommend: null
  },
  {
    title: "提出物共有",
    description: "提出物の期限が書かれてるよ❤",
    thumbnail: "学習.png",
    url: "https://calendar.google.com/calendar/u/0?cid=Y184OTcwNjUzMGZkZWQ1MGRhMjdhYTE0MmEyNTJmMmVjMzU3NTMxNGY2YTk3NjA5MzcyN2VlODg2MTQ3NDkxYmU5QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20",
    recommend: "みんなで協力"
  },  
  {
    title: "3Dトレーニング",
    description: "三次元空間で頭を鍛える新しい体験。完成までもう少し待っててね！",
    thumbnail: "./apps/app7/thumbnail.png", 
    url: "#",
    recommend: "作成中"
  },
  {
    title: "7番出口",
    description: "不思議な地下通路を探索する作品。異変を見逃さないで。現在工事中。",
    thumbnail: "./apps/app8/thumbnail.png", 
    url: "#",
    recommend: "工事中"
  },
  {
    title: "ちょっとGPT",
    description: "高性能な対話プログラムとおしゃべり。君は何を話す？今はまだ調整中。",
    thumbnail: "./apps/app9/thumbnail.png", 
    url: "#",
    recommend: "調整中"
  }
];

document.addEventListener('DOMContentLoaded', function() {
    // --- 要素取得 ---
    const loader = document.getElementById('loader');
    const skipBtn = document.getElementById('skipBtn');
    const siteWrapper = document.getElementById('site-wrapper');
    const replayStaffRollBtn = document.getElementById('replay-staffroll');
    const fakeTranslator = document.getElementById('fake-translator');
    const translatorInput = document.getElementById('translator-input');
    const translatorOutput = document.getElementById('translator-output');
    const onlineCountDisplay = document.getElementById('online-count-display'); // ★追加
    
    // --- 変数定義 ---
    let staffRollTimer;
    let countdownInterval;
    const clientId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    /**
     * ユーザーを永続的に識別するためのIDを取得・生成する関数
     */
    function getUserId() {
        let userId = localStorage.getItem('sokohara-site-user-id');
        if (!userId) {
            userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
            localStorage.setItem('sokohara-site-user-id', userId);
        }
        return userId;
    }
    const userId = getUserId();


    // --- GAS通信 ---
    async function callGas(action, payload = {}) {
        try {
            if (!GAS_URL || GAS_URL.includes('貼り付け')) {
                throw new Error('GASのURLが設定されていません。');
            }
            const response = await fetch(GAS_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action, payload })
            });
            if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);
            const result = await response.json();
            if (result.status === 'error') throw new Error(result.message);
            return result.data;
        } catch (error) {
            console.error('GAS通信エラー:', error);
        }
    }

    // --- 動的コンテンツの読み込み ---
    function populateDynamicContent() {
        const notificationTitle = document.getElementById('notification-title');
        const notificationText = document.getElementById('notification-text');
        if (notificationTitle) notificationTitle.textContent = notificationData.title;
        if (notificationText) {
            const formattedText = notificationData.text.replace(/#(.*?)#/g, '<span class="highlight">$1</span>');
            notificationText.innerHTML = formattedText;
        }

        const updateInfoTitle = document.getElementById('update-info-title');
        const updateInfoVideo = document.getElementById('update-info-video');
        const updateInfoFutureList = document.getElementById('update-info-future-list');
        if (updateInfoTitle) {
            updateInfoTitle.innerHTML = updateInfoData.titles.join('<br>');
        }
        if (updateInfoVideo) updateInfoVideo.src = updateInfoData.video;
        if (updateInfoFutureList) {
            updateInfoFutureList.innerHTML = '';
            updateInfoData.futureUpdates.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                updateInfoFutureList.appendChild(li);
            });
        }
        
        const scheduleList = document.getElementById('schedule-list');
        if (scheduleList) {
            scheduleList.innerHTML = '';
            scheduleData.forEach(item => {
                const li = document.createElement('li');
                li.style.cssText = "display: flex; justify-content: space-between; padding: 0.8rem 0; border-bottom: 1px solid var(--panel-border);";
                li.innerHTML = `<span>${item.name}</span> <span>${item.date}</span>`;
                scheduleList.appendChild(li);
            });
        }
    }

    // --- 毎日AM8時にリロード ---
    function scheduleDailyReload() {
        const now = new Date();
        const reloadTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0);
        if (now.getTime() > reloadTime.getTime()) {
            reloadTime.setDate(reloadTime.getDate() + 1);
        }
        const timeout = reloadTime.getTime() - now.getTime();
        setTimeout(() => window.location.reload(true), timeout);
    }
    
    // --- サイト初期化フロー ---
    function initSiteFlow() {
        playStaffRoll();
    }

    // スタッフロールが終わった後の処理
    function afterStaffRoll() {
        callGas('accessStart', { clientId: clientId, userId: userId });

        const tutorialCompleted = localStorage.getItem('tutorialCompleted');
        if (!tutorialCompleted) {
            runTutorial(() => checkTermsAndStart());
        } else {
            checkTermsAndStart();
        }
    }

    function runTutorial(callback) {
        const modal = document.getElementById('tutorial-modal');
        const steps = modal.querySelectorAll('.tutorial-step');
        const nextBtn = document.getElementById('tutorial-next-btn');
        const prevBtn = document.getElementById('tutorial-prev-btn');
        const skipBtn = document.getElementById('tutorial-skip-btn');
        const indicator = document.getElementById('tutorial-step-indicator');
        let currentStep = 0;
        const totalSteps = steps.length;

        function updateStep() {
            steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
            indicator.textContent = `${currentStep + 1} / ${totalSteps}`;
            prevBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
            nextBtn.textContent = currentStep === totalSteps - 1 ? '完了' : '次へ';
        }

        function completeTutorial() {
            localStorage.setItem('tutorialCompleted', 'true');
            modal.classList.remove('visible');
            callback();
        }

        nextBtn.addEventListener('click', () => {
            if (currentStep < totalSteps - 1) {
                currentStep++;
                updateStep();
            } else {
                completeTutorial();
            }
        });
        prevBtn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateStep();
            }
        });
        skipBtn.addEventListener('click', completeTutorial);
        modal.classList.add('visible');
        document.body.classList.add('no-scroll');
        updateStep();
    }

    function checkTermsAndStart() {
        const termsAgreed = localStorage.getItem('termsAgreed');
        if (!termsAgreed) {
            const termsModal = document.getElementById('terms-modal');
            termsModal.classList.add('visible');
            document.body.classList.add('no-scroll');
            document.getElementById('terms-agree-btn').addEventListener('click', () => {
                localStorage.setItem('termsAgreed', 'true');
                termsModal.classList.remove('visible');
                document.body.classList.remove('no-scroll');
                startSiteWithCountdown();
            });
        } else {
            startSiteWithCountdown();
        }
    }
    
    // ★★★ ここから関数を追加・変更 ★★★
    /**
     * オンライン人数を非同期で取得して表示を更新する関数
     */
    async function updateOnlineCount() {
        try {
            const data = await callGas('getOnlineCount');
            // dataとdata.onlineCountが存在し、かつ数値であることを確認
            if (data && typeof data.onlineCount === 'number') {
                onlineCountDisplay.textContent = `${data.onlineCount} 人`;
            } else {
                onlineCountDisplay.textContent = '-- 人'; // データ取得失敗時
            }
        } catch (error) {
            console.error("オンライン人数の取得に失敗:", error);
            onlineCountDisplay.textContent = 'エラー';
        }
    }

    function startSiteWithCountdown() {
        const assumedAge = 14; 
        startCountdown(assumedAge);
        showMainContent();

        // オンライン人数の表示を開始
        updateOnlineCount(); // 最初に一度呼び出す
        setInterval(updateOnlineCount, 15000); // 15秒ごとに更新
    }
    // ★★★ ここまで関数を追加・変更 ★★★

    // --- カウントダウン機能 ---
    const countdownMessages = [
        "この時間の何時間を遊びに使うのでしょうか？",
        "残り時間は、わずかです。",
        "時は金なり。有効に使おう。",
        "今日という日は、残りの人生の最初の一日。"
    ];

    function startCountdown(age) {
        const countdownTimerEl = document.getElementById('countdown-timer');
        const countdownMessageEl = document.getElementById('countdown-message');
        const testCountdownEl = document.getElementById('test-countdown-timer');
        const birthdayCountdownEl = document.getElementById('birthday-countdown-timer');
        const schoolTripCountdownEl = document.getElementById('school-trip-countdown-timer');

        const now = new Date();
        const targetDate = new Date(now.getFullYear() + (90 - age), now.getMonth(), now.getDate());

        function updateLifeCountdown() {
            const remaining = targetDate - new Date();
            if (remaining < 0) {
                countdownTimerEl.textContent = "目標達成！";
                return;
            }
            const seconds = Math.floor((remaining / 1000) % 60);
            const minutes = Math.floor((remaining / 1000 / 60) % 60);
            const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
            const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
            const weeks = Math.floor(days / 7);
            
            countdownTimerEl.innerHTML = `${weeks}<span>週</span> ${days % 7}<span>日</span> ${hours}<span>時間</span> ${minutes}<span>分</span> ${seconds}<span>秒</span>`;
        }
        
        function updateDaysCountdown() {
            const now = new Date();
            const currentYear = now.getFullYear();
    
            const testDate = new Date(currentYear, 10, 18);
            if (now > testDate) {
                 testCountdownEl.textContent = '終了';
            } else {
                const testDiff = Math.ceil((testDate - now) / (1000 * 60 * 60 * 24));
                testCountdownEl.textContent = `${testDiff} 日`;
            }
            
            const schoolTripDate = new Date(2026, 0, 16);
            if (now > schoolTripDate) {
                schoolTripCountdownEl.textContent = '終了';
            } else {
                const tripDiff = Math.ceil((schoolTripDate - now) / (1000 * 60 * 60 * 24));
                schoolTripCountdownEl.textContent = `${tripDiff} 日`;
            }
    
            let birthdayDate = new Date(currentYear, 3, 6);
            if (now > birthdayDate) {
                birthdayDate.setFullYear(currentYear + 1);
            }
            const birthdayDiff = Math.ceil((birthdayDate - now) / (1000 * 60 * 60 * 24));
            birthdayCountdownEl.textContent = `${birthdayDiff} 日`;
        }

        function updateAllCountdowns() {
            updateLifeCountdown();
            updateDaysCountdown();
        }

        updateAllCountdowns();
        countdownInterval = setInterval(updateAllCountdowns, 1000);

        countdownMessageEl.textContent = countdownMessages[Math.floor(Math.random() * countdownMessages.length)];
        setInterval(() => {
            countdownMessageEl.textContent = countdownMessages[Math.floor(Math.random() * countdownMessages.length)];
        }, 10000);
    }

    // --- スタッフロールとサイト表示 ---
    function playStaffRoll() {
        const container = document.getElementById('staffRollContainer');
        const oldCredits = container.querySelector('.credits-list');
        if(oldCredits) {
            const newCredits = oldCredits.cloneNode(true);
            oldCredits.remove();
            container.appendChild(newCredits);
        }
        document.body.classList.add('no-scroll');
        loader.classList.remove('fade-out');
        siteWrapper.classList.remove('visible');
        clearTimeout(staffRollTimer);
        staffRollTimer = setTimeout(onStaffRollEnd, 20000);
    }

    function onStaffRollEnd() {
        if (!loader.classList.contains('fade-out')) {
            loader.classList.add('fade-out');
            afterStaffRoll();
        }
    }

    function showMainContent() {
        document.body.classList.remove('no-scroll');
        siteWrapper.classList.add('visible');
        
        const lastShown = localStorage.getItem('notificationLastShown');
        const today = new Date().toISOString().slice(0, 10);
        const shouldShow = !notificationData.showOncePerDay || (notificationData.showOncePerDay && lastShown !== today);

        if (shouldShow) {
            const notificationModal = document.getElementById('notification-modal');
            const closeBtn = document.getElementById('notification-close-btn');
            setTimeout(() => { 
                notificationModal.classList.add('visible'); 
                if (notificationData.showOncePerDay) {
                    localStorage.setItem('notificationLastShown', today);
                }
                let count = notificationData.closeDelaySeconds || 0;
                closeBtn.disabled = true;
                if (count > 0) {
                    closeBtn.textContent = `閉じる (${count})`;
                    const timer = setInterval(() => {
                        count--;
                        if (count > 0) {
                            closeBtn.textContent = `閉じる (${count})`;
                        } else {
                            clearInterval(timer);
                            closeBtn.disabled = false;
                            closeBtn.textContent = '閉じる';
                        }
                    }, 1000);
                } else {
                    closeBtn.disabled = false;
                    closeBtn.textContent = '閉じる';
                }
            }, 500);
        }
    }
    
    skipBtn.addEventListener('click', () => { clearTimeout(staffRollTimer); onStaffRollEnd(); });
    replayStaffRollBtn.addEventListener('click', playStaffRoll);

    
    // --- キーボードイベント (チートコード & 偽翻訳) ---
    let cheatCodeBuffer = null;
    let cheatTimeout;
    document.addEventListener('keydown', (e) => {
        if (e.target.closest('input, textarea') || document.querySelector('.modal-overlay.visible')) {
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            fakeTranslator.classList.toggle('hidden');
            cheatCodeBuffer = null;
            return;
        }
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            cheatCodeBuffer = '';
            clearTimeout(cheatTimeout);
            cheatTimeout = setTimeout(() => { cheatCodeBuffer = null; }, 3000);
            return;
        }
        if (cheatCodeBuffer !== null) {
            if (e.key.length === 1) {
                cheatCodeBuffer += e.key.toLowerCase();
            }
            if (cheatCodeBuffer === 'reset') {
                if (confirm('チュートリアル、利用規約の同意状況、ユーザーIDをリセットしますか？\n（次回アクセス時に新規ユーザーとしてカウントされます）')) {
                    localStorage.removeItem('tutorialCompleted');
                    localStorage.removeItem('termsAgreed');
                    localStorage.removeItem('notificationLastShown');
                    localStorage.removeItem('sokohara-site-user-id');
                    alert('設定をリセットしました。ページをリロードします。');
                    window.location.reload();
                }
                cheatCodeBuffer = null;
                clearTimeout(cheatTimeout);
            }
        }
    });

    // ページを離れるときにオンライン人数を減らす処理を送信
    window.addEventListener('beforeunload', () => {
        const data = JSON.stringify({ action: 'accessEnd', payload: { clientId: clientId } });
        if (navigator.sendBeacon) {
            navigator.sendBeacon(GAS_URL, new Blob([data], {type : 'text/plain; charset=UTF-8'}));
        }
    });

    // --- 偽翻訳の簡易ロジック ---
    translatorInput.addEventListener('input', () => {
        translatorOutput.value = simpleTranslate(translatorInput.value);
    });
    function simpleTranslate(text) {
        const map = {'a':'あ', 'i':'い', 'u':'う', 'e':'え', 'o':'お', ' ':'　'};
        return text.toLowerCase().split('').map(char => map[char] || char).join('');
    }

    // --- ナビゲーションタブ切り替え ---
    const navLinks = document.querySelectorAll('nav a[data-target]');
    const contentSections = document.querySelectorAll('.content-section');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const targetId = event.target.dataset.target;
            contentSections.forEach(section => section.classList.remove('active'));
            document.getElementById(`content-${targetId}`).classList.add('active');
        });
    });

    // --- 作品カードの動的生成 ---
    const itemListContainer = document.getElementById('item-list');
    items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item-card';
        itemElement.dataset.itemId = index;
        let recommendBadge = item.recommend ? `<div class="recommend-badge">${item.recommend}</div>` : '';
        itemElement.innerHTML = `${recommendBadge}<div class="thumbnail-container"><img src="${item.thumbnail}" alt="${item.title}" onerror="this.parentElement.innerHTML = '<p style=\'text-align:center;padding:20px;\'>画像が見つかりません</p>';"></div><div class="item-card-content"><h3 class="item-card-title">${item.title}</h3><p class="item-card-desc">${item.description}</p></div>`;
        itemListContainer.appendChild(itemElement);
    });

    // --- モーダル関連の処理 ---
    const detailsModal = document.getElementById('details-modal');
    const shareModal = document.getElementById('share-modal');
    const updateInfoModal = document.getElementById('update-info-modal');
    const scheduleModal = document.getElementById('schedule-modal');
    const showUpdateInfoBtn = document.getElementById('show-update-info-btn');
    const showScheduleBtn = document.getElementById('show-schedule-btn');

    showUpdateInfoBtn.addEventListener('click', () => updateInfoModal.classList.add('visible'));
    showScheduleBtn.addEventListener('click', () => scheduleModal.classList.add('visible'));
    
    let currentItemUrl = '';

    itemListContainer.addEventListener('click', function(event) {
        const clickedCard = event.target.closest('.item-card');
        if (clickedCard) {
            const itemData = items[clickedCard.dataset.itemId];
            if (itemData.url === '#') {
                alert('この作品は現在作成中です。お楽しみに！');
                return;
            }
            currentItemUrl = itemData.url;
            document.getElementById('details-modal-title').textContent = itemData.title;
            document.getElementById('details-modal-img').src = itemData.thumbnail;
            document.getElementById('details-modal-desc').textContent = itemData.description;
            document.getElementById('details-modal-launch-btn').href = itemData.url;
            detailsModal.classList.add('visible');
        }
    });
    
    function openShareModal(title, url) {
        document.getElementById('share-modal-title').textContent = title;
        document.getElementById('share-url-input').value = url;
        const qrcodeContainer = document.getElementById('qrcode');
        qrcodeContainer.innerHTML = '';
        QRCode.toCanvas(url, { width: 220, errorCorrectionLevel: 'H' }, (err, canvas) => {
            if (err) {
                console.error(err);
                qrcodeContainer.innerHTML = '<p style="color: var(--text-secondary); text-align:center; padding: 20px 0;">QRコードの生成に失敗しました。<br>URLをコピーしてご利用ください。</p>';
                return;
            }
            qrcodeContainer.appendChild(canvas);
        });
        shareModal.classList.add('visible');
    }

    document.getElementById('details-modal-share-btn').addEventListener('click', () => {
        const url = new URL(currentItemUrl, window.location.href).href;
        openShareModal('作品を共有', url);
        detailsModal.classList.remove('visible');
    });
    
    document.getElementById('share-site-btn').addEventListener('click', () => {
        openShareModal('このサイトを共有', window.location.href);
    });
    
    document.getElementById('copy-url-btn').addEventListener('click', (e) => {
        const urlInput = document.getElementById('share-url-input');
        const urlToCopy = urlInput.value;
        const button = e.target;

        navigator.clipboard.writeText(urlToCopy).then(() => {
            button.textContent = 'コピー完了!';
            setTimeout(() => { button.textContent = 'コピー'; }, 2000);
        }).catch(err => {
            console.error('クリップボードへのコピーに失敗:', err);
            try { 
                urlInput.select();
                document.execCommand('copy'); 
                button.textContent = 'コピー完了!'; 
                setTimeout(() => { button.textContent = 'コピー'; }, 2000); 
            } catch (err) { 
                alert('自動コピーがサポートされていません。'); 
            }
        });
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('visible')));
    document.querySelectorAll('.modal-overlay').forEach(overlay => overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('visible'); }));

    // --- サイト起動 ---
    populateDynamicContent();
    scheduleDailyReload();
    initSiteFlow();
});
