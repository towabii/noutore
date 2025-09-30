// ===============================================
// 簡単更新エリア
// ここの情報を書き換えるだけでサイトに反映されます
// ===============================================

// 「今日の一言」の内容
const oneWordData = {
    image: "hitokoto.jpeg", // 画像ファイル名
    text: "ゲーム達を開発している環境はこちらです。一人悲しく開発してます(この文を書いてる時間は2:45 はよ寝よう)" // 表示する文章
};

// 「アップデート情報」の内容
const updateInfoData = {
    title: "ブロック落としにCPU(人工知能)が追加！",
    title: "中間テストまでの日にち、とわの誕生日までの日にちが追加！",
    title: "とわの仕事(8件)が終わるまでアプデはありません。",// メインのアップデートタイトル
    video: "cpu.mp4", // 表示する動画ファイル名
    futureUpdates: [
        "ブロックトレーニングにCPUを追加予定",
        "果物集めにもCPUを追加予定"
        "リンゴクリッカーを追加予定"
    ] // 今後のアップデート予定 (必要なだけ追加・削除できます)
};

// 「実装予定日一覧」の内容
const scheduleData = [
    { name: "ジオメタリートレーニング", date: "10月23日" },
    { name: "3Dトレーニング", date: "11月7日" },
    { name: "ちょっとGPT", date: "11月30日" },
    { name: "7番出口", date: "12月25日" }
    { name: "リンゴクリッカー", date: "10月11日" }
    { name: "時計", date: "明日" }
]; // { name: "ゲーム名", date: "日付" } の形式で追加・削除できます

// ===============================================
// 簡単更新エリアここまで
// ===============================================


const items = [
  {
    title: "ブロック落とし",
    description: "あれをを底原永和がまあパクったゲーム",
    thumbnail: "./apps/app1/thumbnail.png",
    url: "./apps/app1/index.html",
    recommend: "とわ一押し"
  },
  {
    title: "ブロック落としCPUモード",
    description: "CPU(人工知能)と対戦できるブロック落とし！あなたは勝てるか！？",
    thumbnail: "./apps/app10/thumbnail.png",
    url: "./apps/app10/index.html",
    recommend: "早期アクセスバージョン"
  },
  {
    title: "ブロックトレーニング",
    description: "同じ色のブロックをそろえて消そう！連鎖が気持ちいい！",
    thumbnail: "./apps/app2/thumbnail.png",
    url: "./apps/app2/index.html",
    recommend: "今までの人気！"
  },
    {
    title: "ブロックトレーニングCPUモード",
    description: "同じ色のブロックをそろえて消そう！CPUに勝てるのか！！",
    thumbnail: "./apps/app2/thumbnail.png",
    url: "#",
    recommend: "作成中"
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
    
    // --- 変数定義 ---
    let staffRollTimer;
    let countdownInterval;

    // --- 動的コンテンツの読み込み ---
    function populateDynamicContent() {
        // 今日の一言
        const oneWordImg = document.getElementById('oneword-img');
        const oneWordText = document.getElementById('oneword-text');
        if (oneWordImg) oneWordImg.src = oneWordData.image;
        if (oneWordText) oneWordText.textContent = oneWordData.text;

        // アップデート情報
        const updateInfoTitle = document.getElementById('update-info-title');
        const updateInfoVideo = document.getElementById('update-info-video');
        const updateInfoFutureList = document.getElementById('update-info-future-list');
        if (updateInfoTitle) updateInfoTitle.textContent = updateInfoData.title;
        if (updateInfoVideo) updateInfoVideo.src = updateInfoData.video;
        if (updateInfoFutureList) {
            updateInfoFutureList.innerHTML = ''; // リストを初期化
            updateInfoData.futureUpdates.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                updateInfoFutureList.appendChild(li);
            });
        }
        
        // 実装予定日一覧
        const scheduleList = document.getElementById('schedule-list');
        if (scheduleList) {
            scheduleList.innerHTML = ''; // リストを初期化
            scheduleData.forEach(item => {
                const li = document.createElement('li');
                li.style.cssText = "display: flex; justify-content: space-between; padding: 0.8rem 0; border-bottom: 1px solid var(--panel-border);";
                li.innerHTML = `<span>${item.name}</span> <span>${item.date}</span>`;
                scheduleList.appendChild(li);
            });
        }
    }
    
    // --- サイト初期化フロー ---
    function initSiteFlow() {
        const tutorialCompleted = localStorage.getItem('tutorialCompleted');
        if (!tutorialCompleted) {
            runTutorial(() => checkTerms());
        } else {
            checkTerms();
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
            steps.forEach((step, index) => {
                step.classList.toggle('active', index === currentStep);
            });
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
        updateStep();
    }

    function checkTerms() {
        const termsAgreed = localStorage.getItem('termsAgreed');
        if (!termsAgreed) {
            const termsModal = document.getElementById('terms-modal');
            termsModal.classList.add('visible');
            document.getElementById('terms-agree-btn').addEventListener('click', () => {
                localStorage.setItem('termsAgreed', 'true');
                termsModal.classList.remove('visible');
                checkAgeAndStart();
            });
        } else {
            checkAgeAndStart();
        }
    }

    function checkAgeAndStart() {
        let userAge = localStorage.getItem('userAge');
        if (!userAge) {
            const ageInput = prompt('あなたの現在の年齢を半角数字で入力してください。人生の残り時間を表示します。');
            if (ageInput && !isNaN(ageInput) && parseInt(ageInput) > 0) {
                userAge = parseInt(ageInput);
                localStorage.setItem('userAge', userAge);
            } else {
                alert('無効な値です。ページをリロードして再入力してください。');
                return;
            }
        }
        startCountdown(parseInt(userAge));
        startSite();
    }

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
    
            // 中間テスト (11月18日)
            const testDate = new Date(currentYear, 10, 18); // 月は0-11
            if (now > testDate) {
                 testCountdownEl.textContent = '終了';
            } else {
                const testDiff = Math.ceil((testDate - now) / (1000 * 60 * 60 * 24));
                testCountdownEl.textContent = `${testDiff} 日`;
            }
    
            // 誕生日 (4月6日)
            let birthdayDate = new Date(currentYear, 3, 6); // 月は0-11
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
        }, 10000); // 10秒ごとにメッセージを更新
    }


    // --- スタッフロールとサイト表示 ---
    function startSite() {
        if (document.body.dataset.siteStarted) return;
        document.body.dataset.siteStarted = true;
        playStaffRoll();
    }

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
        staffRollTimer = setTimeout(showMainContent, 20000);
    }

    function showMainContent() {
        if (!loader.classList.contains('fade-out')) {
            loader.classList.add('fade-out');
            document.body.classList.remove('no-scroll');
            siteWrapper.classList.add('visible');
            
            const lastShown = localStorage.getItem('onewordLastShown');
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            
            if (lastShown !== today) {
                const onewordModal = document.getElementById('oneword-modal');
                setTimeout(() => { 
                    onewordModal.classList.add('visible'); 
                    localStorage.setItem('onewordLastShown', today);
                }, 500);
            }
        }
    }
    
    skipBtn.addEventListener('click', () => { clearTimeout(staffRollTimer); showMainContent(); });
    replayStaffRollBtn.addEventListener('click', playStaffRoll);

    
    // --- キーボードイベント (チートコード & 偽翻訳) ---
    let cheatCodeBuffer = null;
    let cheatTimeout;
    document.addEventListener('keydown', (e) => {
        if (e.target.closest('input, textarea') || document.querySelector('.modal-overlay.visible')) {
            return;
        }
        // Enterキーで偽翻訳サイトをトグル
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
                if (confirm('本当に設定（年齢・利用規約同意）をリセットしますか？')) {
                    localStorage.removeItem('userAge');
                    localStorage.removeItem('termsAgreed');
                    localStorage.removeItem('tutorialCompleted');
                    localStorage.removeItem('onewordLastShown');
                    alert('設定をリセットしました。ページをリロードします。');
                    window.location.reload();
                }
                cheatCodeBuffer = null;
                clearTimeout(cheatTimeout);
            }
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

    showUpdateInfoBtn.addEventListener('click', () => {
        updateInfoModal.classList.add('visible');
    });
    showScheduleBtn.addEventListener('click', () => {
        scheduleModal.classList.add('visible');
    });

    let currentItemUrl = '';

    // 作品詳細モーダル表示
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
    
    // 共有モーダルを開く汎用関数
    function openShareModal(title, url) {
        document.getElementById('share-modal-title').textContent = title;
        document.getElementById('share-url-input').value = url;
        const qrcodeContainer = document.getElementById('qrcode');
        qrcodeContainer.innerHTML = '';
        QRCode.toCanvas(url, { width: 220, errorCorrectionLevel: 'H' }, (err, canvas) => {
            if (err) return console.error(err);
            qrcodeContainer.appendChild(canvas);
        });
        shareModal.classList.add('visible');
    }

    // 作品の共有ボタン
    document.getElementById('details-modal-share-btn').addEventListener('click', () => {
        const url = new URL(currentItemUrl, window.location.href).href;
        openShareModal('作品を共有', url);
        detailsModal.classList.remove('visible');
    });
    
    // サイト自体の共有ボタン
    document.getElementById('share-site-btn').addEventListener('click', () => {
        openShareModal('このサイトを共有', window.location.href);
    });
    
    // URLコピーボタン（フォールバック対応）
    document.getElementById('copy-url-btn').addEventListener('click', (e) => {
        const urlInput = document.getElementById('share-url-input');
        const urlToCopy = urlInput.value;
        const button = e.target;

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(urlToCopy).then(() => {
                button.textContent = 'コピー完了!';
                setTimeout(() => { button.textContent = 'コピー'; }, 2000);
            }).catch(err => console.error('クリップボードへのコピーに失敗:', err));
        } else {
            urlInput.select();
            try {
                document.execCommand('copy');
                button.textContent = 'コピー完了!';
                setTimeout(() => { button.textContent = 'コピー'; }, 2000);
            } catch (err) {
                alert('このブラウザでは自動コピーがサポートされていません。手動でコピーしてください。');
            }
        }
    });

    // モーダルを閉じる処理
    document.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('visible')));
    document.querySelectorAll('.modal-overlay').forEach(overlay => overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('visible'); }));

    // --- サイト起動 ---
    populateDynamicContent(); // サイトの動的コンテンツを読み込む
    initSiteFlow();
});
