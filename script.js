// ===============================================
// ▲▲▲ 必ず設定してください ▲▲▲
// ===============================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycby1mXeLe5GTei_gDN-RPBYfWOAavtxpICC4L8YV46p_G8yr9XPp7hXkdUgLz1B1mcQX/exec';

// ===============================================
// 簡単更新エリア
// ===============================================

// --- 【修正】カウントダウンの設定 ---
// ここで表示したいカウントダウンを自由に設定できます。
// label: カードのヘッダーに表示されるテキスト
// type: 'life' (人生終了まで), 'online' (オンライン人数) の特別なカード
// date: 'YYYY/MM/DD' または 'MM/DD' 形式で指定。'MM/DD'の場合は次のその日付までの日数を計算します。
// span: 'full' を指定するとカードが横幅いっぱいに表示されます。
const countdownConfig = [
    { label: "人生終了まで", type: "life", span: "full" },
    { label: "期末テストまで", date: "2026/02/16" },
    { label: "クリスマスまで", date: "2025/12/25" },
    { label: "修学旅行まで", date: "2026/01/16" },
    { label: "修了式まで", date: "2026/03/19" },
    { label: "底原永和の誕生日まで", date: "04/06" },
    { label: "現在のアクセス人数", type: "online" }
];

// --- 【修正】不定期アンケートの設定 ---
// ここで不定期に表示するアンケートの内容を設定します。
const surveyData = {
    // 【重要】アンケートID：このIDで回答済みかを記録します。
    // アンケート内容を変更した場合は、必ずこのIDも新しいものに変更してください。
    // (例: "survey_001" -> "survey_002")
    // こうしないと、古いアンケートに回答済みのユーザーに新しいアンケートが表示されません。
    id: "20251103_satisfaction_survey", 

    // アンケートの質問文です。モーダルのタイトルとして表示されます。
    question: "このサイトに評価をつけるならいくつですか？",

    // アンケートの選択肢です。
    // []の中に、""で囲んだ選択肢をカンマ(,)で区切って記述します。
    options: [ 
        "★5", "★4", "★3", "★2", "★1", "★0"
    ],
};

// --- お知らせモーダルの設定 ---
const notificationData = {
    title: "【追加】追加アプリについて",
    text: "ご利用いただきありがとうございます。とわの連絡先一覧、スタディープランナーを正式に実装しました。スタディープランナーについては初の教育系アプリなのでぜひ使ってくださいね！<br>",
    closeDelaySeconds: 0,
    showOncePerDay: false 
};

// --- アップデート情報の設定 ---
const updateInfoData = {
    history: [
        { version: "v13.1", date: "2025-10-21", title: "大規模アップデート", details: ["サイトのデザインを全面的にリニューアルしました。", "各種カウントダウン機能を追加しました。", "パフォーマンスの改善を行いました。"], video: "cpu.mp4" },
        { version: "v13.0", date: "2025-10-15", title: "CPUシステムを開発", details: ["ブロック落としのCPUを開発しました。", "ブロックトレーニングのCPUを追加しました", "諸々のバグを修正しました"], video: null }
    ],
    future: ["ジオメタリートレーニングを追加", "果物集めにもCPUを追加予定", "リンゴクリッカーを追加予定"]
};

// --- 実装予定日の設定 ---
const scheduleData = [
    { name: "ジオメタリートレーニング", date: "10月23日" }, { name: "3Dトレーニング", date: "11月7日" }, { name: "ちょっとGPT", date: "11月30日" },
    { name: "7番出口", date: "12月25日" }, { name: "キャンディークリッカー", date: "10月11日" }, { name: "", date: "" }
];

// --- 作品リストの設定 ---
const items = [
    { title: "ブロック落とし", description: "CPUと対戦できるブロック落とし！あなたは勝てるか！？", thumbnail: "./apps/app10/thumbnail.jpeg", url: "./apps/app10/index.html", recommend: "一番頑張った", category: "fun" },
    { title: "ブロックトレーニング", description: "同じ色のブロックをそろえて消そう！連鎖が気持ちいい！", thumbnail: "./apps/app2/thumbnail.png", url: "./apps/app2/index.html", recommend: "一番人気！", category: "fun" },
    { title: "果物集め", description: "大きな果物を作ろう！人気のスイカのあれ風の楽しいやつ。", thumbnail: "./apps/app3/thumbnail.png", url: "./apps/app3/index.html", recommend: null, category: "fun" },
    { title: "学習プランナー Pro", description: "提出物の期限を管理できるカレンダー。これで提出忘れもなし！", thumbnail: "学習.png", url: "./apps/TODO/index.html", recommend: "GOOD", category: "study" },
    { title: "ジオメタリートレーニング", description: "リズムに合わせてジャンプ！シンプルな操作性がクセになる、早期アクセスバージョン。", thumbnail: "./apps/app5/thumbnail.png", url: "./apps/app5/index.html", recommend: "早期アクセス", category: "fun" },
    { title: "ちょっとGPT", description: "高性能な対話プログラムとおしゃべり。宿題の相談から雑談まで、君は何を話す？", thumbnail: "./apps/app9/thumbnail.png", url: "#", recommend: "調整中", category: "other" },
    { title: "待ち針のやつ", description: "回転する円に針を刺していく、シンプルながらも奥が深いタイミングトレーニング。", thumbnail: "./apps/app6/thumbnail.png", url: "./apps/app6/index.html", recommend: null, category: "fun" },
    { title: "ボール移動", description: "意外と人気！！", thumbnail: "./apps/app4/thumbnail.png", url: "./apps/app4/index.html", recommend: null, category: "fun" },
    { title: "3Dトレーニング", description: "三次元空間で頭を鍛える新しい体験。完成までもう少し待っててね！", thumbnail: "./apps/app7/thumbnail.jpeg", url: "#", recommend: "作成中", category: "fun" },
    { title: "7番出口", description: "不思議な地下通路を探索する作品。異変を見逃さないで。現在工事中。", thumbnail: "./apps/app8/thumbnail.png", url: "#", recommend: "工事中", category: "fun" },
    { title: "砂ブロック落とし", description: "最近流行ってるあれ", thumbnail: "./apps/app12/thumbnail.jpeg", url: "#", recommend: "作成中", category: "fun" },
    { title: "ブロック崩し", description: "グーグルのねあれよあれ", thumbnail: "./apps/app13/thumbnail.jpeg", url: "#", recommend: "作成中", category: "fun" },
    { title: "パズルブロック", description: "まあ、楽しくない", thumbnail: "./apps/app14/thumbnail.jpeg", url: "#", recommend: "作成中", category: "fun" },
    { title: "キャンディークリッカー", description: "暇つぶし", thumbnail: "./apps/app16/thumbnail.jpeg", url: "#", recommend: "作成中", category: "fun" },
];

// ===============================================
// 簡単更新エリアここまで
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
    // --- 要素取得 ---
    const loader = document.getElementById('loader');
    const siteWrapper = document.getElementById('site-wrapper');
    const themeToggle = document.getElementById('theme-toggle');
    const staffRollContainer = document.getElementById('staffRollContainer');
    const creditsPre = document.getElementById('credits-text');
    const welcomeContainer = document.getElementById('welcome-animation-container');

    let staffRollTimer, countdownInterval, typingInterval;
    const clientId = Date.now().toString(36) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // --- 【新規追加】オンライン状態管理 ---
    const INACTIVITY_TIMEOUT = 3600 * 1000; // 1時間
    let inactivityTimer;
    let isOnline = false;

    function getUserId() {
        let userId = localStorage.getItem('sokohara-site-user-id');
        if (!userId) {
            userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('sokohara-site-user-id', userId);
        }
        return userId;
    }
    const userId = getUserId();

    async function callGas(action, payload = {}) {
        try {
            if (!GAS_URL || GAS_URL.includes('貼り付け')) throw new Error('GASのURLが設定されていません。');
            const response = await fetch(GAS_URL, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, payload }) });
            if (!response.ok) throw new Error(`サーバーエラー: ${response.status}`);
            const result = await response.json();
            if (result.status === 'error') throw new Error(result.message);
            return result.data;
        } catch (error) { 
            console.error('GAS通信エラー:', error);
            throw error;
        }
    }

    // --- 【新規追加】オンライン状態を管理する関数 ---
    function goOnline() {
        if (isOnline) return;
        isOnline = true;
        callGas('accessStart', { clientId, userId });
        resetInactivityTimer();
        console.log("Status: Online");
    }

    function goOffline(isBeacon = false) {
        if (!isOnline) return;
        isOnline = false;
        clearTimeout(inactivityTimer);
        const payload = { action: "accessEnd", payload: { clientId } };
        if (isBeacon && navigator.sendBeacon) {
            navigator.sendBeacon(GAS_URL, new Blob([JSON.stringify(payload)], { type: "text/plain; charset=UTF-8" }));
        } else {
            callGas('accessEnd', { clientId });
        }
        console.log("Status: Offline");
    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => goOffline(), INACTIVITY_TIMEOUT);
    }
    
    function handleVisibilityChange() {
        if (document.hidden) {
            goOffline();
        } else {
            goOnline();
        }
    }

    // --- 【新規追加】カウントダウンカードを動的に生成 ---
    function generateCountdownCards() {
        const container = document.getElementById('countdown-container');
        if (!container) return;
        container.innerHTML = '';
        countdownConfig.forEach((config, index) => {
            const card = document.createElement('div');
            card.className = 'countdown-card';
            if (config.span === 'full') card.classList.add('main');
            
            let valueHtml = '';
            if (config.type === 'life') {
                valueHtml = `<div id="countdown-timer" class="countdown-value-large">--</div><div id="countdown-message" class="countdown-sub-label"></div>`;
            } else if (config.type === 'online') {
                valueHtml = `<div id="online-count-display" class="countdown-value">-- 人</div>`;
            } else {
                card.id = `countdown-card-${index}`;
                valueHtml = `<div class="countdown-value">--</div>`;
            }
            
            card.innerHTML = `<div class="countdown-header">${config.label}</div>${valueHtml}`;
            card.style.animationDelay = `${index * 80}ms`;
            container.appendChild(card);
        });
    }

    function populateDynamicContent() {
        // (省略) 既存のロジックは変更なし
        const notificationTitle = document.getElementById('notification-title');
        const notificationText = document.getElementById('notification-text');
        if (notificationTitle) notificationTitle.textContent = notificationData.title;
        if (notificationText) notificationText.innerHTML = notificationData.text.replace(/#(.*?)#/g, '<strong style="color: var(--accent-color);">$1</strong>');
        const updateContentContainer = document.getElementById('update-info-content');
        const futureListContainer = document.getElementById('update-info-future-list');
        if (updateContentContainer) {
            updateContentContainer.innerHTML = '';
            updateInfoData.history.forEach(update => {
                const item = document.createElement('div'); item.className = 'update-item';
                const detailsHtml = update.details.map(detail => `<li>${detail}</li>`).join('');
                const videoHtml = update.video ? `<video class="update-video" src="${update.video}" autoplay muted loop playsinline onerror="this.style.display='none';"></video>` : '';
                item.innerHTML = `<div class="update-header"><span class="update-version">${update.version}</span><h4 class="update-title">${update.title}</h4><span class="update-date">${update.date}</span></div><ul class="update-details">${detailsHtml}</ul>${videoHtml}`;
                updateContentContainer.appendChild(item);
            });
        }
        if (futureListContainer) {
            futureListContainer.innerHTML = '';
            updateInfoData.future.forEach(itemText => { const li = document.createElement('li'); li.textContent = itemText; futureListContainer.appendChild(li); });
        }
        const scheduleList = document.getElementById('schedule-list');
        if (scheduleList) {
            scheduleList.innerHTML = '';
            scheduleData.forEach(item => { const li = document.createElement('li'); li.style.cssText = "display: flex; justify-content: space-between; padding: 0.8rem 0; border-bottom: 1px solid var(--border-color);"; li.innerHTML = `<span>${item.name}</span> <span style="color: var(--text-secondary);">${item.date}</span>`; scheduleList.appendChild(li); });
        }
    }

    function applyTheme(theme) {
        document.body.dataset.theme = theme;
        themeToggle.checked = theme === 'light';
    }
    
    function initSiteFlow() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);
        playStaffRoll();
    }
    
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    function afterStaffRoll() {
        goOnline(); // 【修正】オンライン状態を開始
        const tutorialCompleted = localStorage.getItem('tutorialCompleted');
        const afterTutorial = () => checkTermsAndStart(() => {
            showMainContent(); 
        });

        if (!tutorialCompleted) { 
            runTutorial(afterTutorial); 
        } 
        else { 
            afterTutorial(); 
        }
    }

    function runTutorial(callback) {
        // (省略) 既存のロジックは変更なし
        const modal = document.getElementById("tutorial-modal");
        const steps = modal.querySelectorAll(".tutorial-step");
        const nextBtn = document.getElementById("tutorial-next-btn");
        const prevBtn = document.getElementById("tutorial-prev-btn");
        const skipBtn = document.getElementById("tutorial-skip-btn");
        const indicator = document.getElementById("tutorial-step-indicator");
        let currentStep = 0;
        const totalSteps = steps.length;
        function updateStep() {
            steps.forEach((step, index) => { step.classList.toggle("active", index === currentStep); });
            indicator.textContent = `${currentStep + 1} / ${totalSteps}`;
            prevBtn.style.visibility = (currentStep === 0) ? "hidden" : "visible";
            nextBtn.textContent = (currentStep === totalSteps - 1) ? "完了" : "次へ";
        }
        function completeTutorial() {
            localStorage.setItem("tutorialCompleted", "true");
            modal.classList.remove("visible");
            document.body.classList.remove("no-scroll");
            if (callback) callback();
        }
        nextBtn.addEventListener("click", () => { if (currentStep < totalSteps - 1) { currentStep++; updateStep(); } else { completeTutorial(); } });
        prevBtn.addEventListener("click", () => { if (currentStep > 0) { currentStep--; updateStep(); } });
        skipBtn.addEventListener("click", completeTutorial);
        modal.classList.add("visible");
        document.body.classList.add("no-scroll");
        updateStep();
    }

    function checkTermsAndStart(callback) {
        // (省略) 既存のロジックは変更なし
        const termsAgreed = localStorage.getItem("termsAgreed");
        if (!termsAgreed) {
            const termsModal = document.getElementById("terms-modal");
            termsModal.classList.add("visible");
            document.body.classList.add("no-scroll");
            document.getElementById("terms-agree-btn").addEventListener("click", () => {
                localStorage.setItem("termsAgreed", "true");
                termsModal.classList.remove("visible");
                document.body.classList.remove("no-scroll");
                promptForAgeAndStart(callback);
            }, { once: true });
        } else {
            promptForAgeAndStart(callback);
        }
    }
    
    function promptForAgeAndStart(callback) {
        // (省略) 既存のロジックは変更なし
        let age = localStorage.getItem('userAge');
        if (!age) {
            let userInput = prompt("あなたの年齢を半角数字で入力してください。\nこの情報は「人生終了まで」の時間を計算するためにのみ使用されます。", "14");
            if (userInput === null || isNaN(parseInt(userInput)) || parseInt(userInput) <= 0 || parseInt(userInput) > 89) {
                age = 14; 
                alert("入力が無効か、範囲外です。デフォルトの年齢 (14歳) で設定します。");
            } else {
                age = parseInt(userInput);
            }
            localStorage.setItem('userAge', age);
        }
        startSite(parseInt(age));
        if(callback) callback();
    }

    async function updateOnlineCount() {
        try {
            const data = await callGas('getOnlineCount');
            const display = document.getElementById('online-count-display');
            if (display) display.textContent = (data && typeof data.onlineCount === 'number') ? `${data.onlineCount} 人` : '-- 人';
        } catch (error) { 
            const display = document.getElementById('online-count-display');
            if (display) display.textContent = 'エラー';
        }
    }
    
    function startSite(age) {
        startCountdown(age);
        updateOnlineCount();
        setInterval(updateOnlineCount, 15000);
    }
    
    // --- 【修正】カウントダウン更新ロジック ---
    const countdownMessages = ["この時間の何時間を遊びに使うのでしょうか？", "残り時間は、わずかです。", "時は金なり。有効に使おう。", "今日という日は、残りの人生の最初の一日。"];
    function startCountdown(age) {
        const birthYear = new Date().getFullYear() - age;
        const lifeTargetDate = new Date(birthYear + 90, new Date().getMonth(), new Date().getDate());
        
        const updateFunctions = [];

        // Life Countdown
        const lifeTimerEl = document.getElementById('countdown-timer');
        if (lifeTimerEl) {
            updateFunctions.push(() => {
                const rem = lifeTargetDate - new Date();
                if (rem < 0) { lifeTimerEl.textContent = "目標達成！"; return; }
                const s = Math.floor(rem / 1000 % 60), m = Math.floor(rem / 60000 % 60), h = Math.floor(rem / 3600000 % 24), d = Math.floor(rem / 86400000), w = Math.floor(d / 7);
                lifeTimerEl.innerHTML = `${w}<span>週</span> ${d % 7}<span>日</span> ${h}<span>時間</span> ${m}<span>分</span> ${s}<span>秒</span>`;
            });
            const lifeMessageEl = document.getElementById('countdown-message');
            if(lifeMessageEl){
                lifeMessageEl.textContent = countdownMessages[Math.floor(Math.random() * countdownMessages.length)];
                setInterval(() => { lifeMessageEl.textContent = countdownMessages[Math.floor(Math.random() * countdownMessages.length)]; }, 10000);
            }
        }
        
        // Date-based Countdowns
        countdownConfig.forEach((config, index) => {
            if (!config.date) return;
            const el = document.querySelector(`#countdown-card-${index} .countdown-value`);
            if(!el) return;

            let targetDate;
            const now = new Date();
            const [month, day] = config.date.split('/').slice(-2).map(Number);
            
            if (config.date.includes('/')) {
                 if (config.date.split('/').length === 3) {
                    targetDate = new Date(config.date);
                } else { // MM/DD
                    targetDate = new Date(now.getFullYear(), month - 1, day);
                    if (now > targetDate) {
                        targetDate.setFullYear(now.getFullYear() + 1);
                    }
                }
            }

            updateFunctions.push(() => {
                const now = new Date();
                if (now > targetDate) {
                    el.textContent = "終了";
                    el.classList.remove('warning');
                    return;
                }
                const days = Math.ceil((targetDate - now) / 86400000);
                el.textContent = `${days} 日`;
                el.classList.toggle('warning', days > 0 && days <= 30);
            });
        });

        const updateAll = () => updateFunctions.forEach(fn => fn());
        updateAll(); 
        clearInterval(countdownInterval);
        countdownInterval = setInterval(updateAll, 1000);
    }
    
    const originalCreditsText = creditsPre.innerHTML;

    function playStaffRoll() {
        const creditsContainer = staffRollContainer.querySelector(".credits-list");
        if (creditsContainer) {
            creditsContainer.style.animation = 'none';
            void creditsContainer.offsetHeight;
            creditsContainer.style.animation = '';
        }

        creditsPre.innerHTML = '';
        document.body.classList.add("no-scroll");
        loader.classList.remove("fade-out");
        staffRollContainer.style.opacity = '1';
        welcomeContainer.style.display = 'none';

        const skipBtn = document.getElementById('skipBtn');
        skipBtn.style.display = 'block';
        const onSkip = () => { clearTimeout(staffRollTimer); clearInterval(typingInterval); onStaffRollEnd(); };
        skipBtn.onclick = onSkip;

        siteWrapper.classList.remove("visible");
        clearTimeout(staffRollTimer);
        clearInterval(typingInterval);

        let charIndex = 0;
        const textToType = originalCreditsText.trim();
        const cursor = '<span class="typing-cursor">█</span>';
        typingInterval = setInterval(() => {
            if (charIndex < textToType.length) {
                charIndex++;
                creditsPre.innerHTML = textToType.substring(0, charIndex) + cursor;
            } else {
                clearInterval(typingInterval);
                creditsPre.innerHTML = textToType + cursor; // Ensure full text is displayed
            }
        }, 30);

        staffRollTimer = setTimeout(onStaffRollEnd, 40000);
    }

    function onStaffRollEnd() {
        if (loader.classList.contains('fade-out')) return;

        const tutorialCompleted = localStorage.getItem('tutorialCompleted');
        if (!tutorialCompleted) {
            staffRollContainer.style.transition = 'opacity 0.5s';
            staffRollContainer.style.opacity = '0';
            document.getElementById('skipBtn').style.opacity = '0';

            setTimeout(() => {
                welcomeContainer.style.display = 'flex';
                welcomeContainer.innerHTML = '';
                const text = "こんにちは";
                text.split('').forEach((char, index) => {
                    const span = document.createElement('span');
                    span.textContent = char;
                    span.className = 'welcome-char';
                    span.style.animationDelay = `${index * 100}ms`;
                    welcomeContainer.appendChild(span);
                    setTimeout(() => span.classList.add('animate'), 50);
                });
                
                setTimeout(() => {
                    loader.classList.add('fade-out');
                    afterStaffRoll();
                }, text.length * 100 + 2000);
            }, 500);
        } else {
            loader.classList.add('fade-out');
            afterStaffRoll();
        }
    }

    function showMainContent() {
        document.body.classList.remove("no-scroll");
        siteWrapper.classList.add("visible");
        const lastShown = localStorage.getItem("notificationLastShown");
        const today = new Date().toISOString().slice(0, 10);
        
        if (notificationData.text && (!notificationData.showOncePerDay || lastShown !== today)) {
            const modal = document.getElementById("notification-modal");
            const closeBtn = document.getElementById("notification-close-btn");
            const closeHandler = () => checkAndShowSurvey();
            const modalCloseHandler = (e) => { if (e.target === modal) closeHandler(); };
            closeBtn.addEventListener('click', closeHandler, { once: true });
            modal.addEventListener('click', modalCloseHandler, { once: true });
            setTimeout(() => {
                modal.classList.add("visible");
                if (notificationData.showOncePerDay) { localStorage.setItem("notificationLastShown", today); }
                let delay = notificationData.closeDelaySeconds || 0;
                closeBtn.disabled = true;
                if (delay > 0) {
                    closeBtn.textContent = `閉じる (${delay})`;
                    const countdown = setInterval(() => {
                        delay--;
                        if (delay > 0) { closeBtn.textContent = `閉じる (${delay})`; }
                        else { clearInterval(countdown); closeBtn.disabled = false; closeBtn.textContent = "閉じる"; }
                    }, 1000);
                } else {
                    closeBtn.disabled = false;
                    closeBtn.textContent = "閉じる";
                }
            }, 500);
        } else {
            checkAndShowSurvey();
        }
    }
    
    let toastTimer;
    function showToast(message) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;
        clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }
    
    // --- 【修正】アンケート表示ロジック ---
    function checkAndShowSurvey() {
        if (!surveyData || !surveyData.id || !surveyData.options || surveyData.options.length < 2) return;
        const hasAnswered = localStorage.getItem('surveyAnswered-' + surveyData.id);
        if (hasAnswered !== 'true') {
            showSurveyModal();
        }
    }

    function showSurveyModal() {
        const modal = document.getElementById("survey-modal");
        const questionEl = document.getElementById("survey-question");
        const optionsContainer = document.getElementById("survey-options-container");
        questionEl.textContent = surveyData.question;
        optionsContainer.innerHTML = '';
        surveyData.options.forEach(optionText => {
            const button = document.createElement('button');
            button.className = 'survey-option-btn';
            button.textContent = optionText;
            button.onclick = () => {
                modal.classList.remove('visible');
                document.body.classList.remove("no-scroll");
                showToast('ご協力ありがとうございました。');
                localStorage.setItem('surveyAnswered-' + surveyData.id, 'true');
                callGas('submitSurvey', {
                    userId: userId, surveyId: surveyData.id,
                    question: surveyData.question, answer: optionText
                }).catch(error => { console.error("アンケートのバックグラウンド送信に失敗:", error); });
            };
            optionsContainer.appendChild(button);
        });
        modal.classList.add('visible');
        document.body.classList.add("no-scroll");
    }

    document.getElementById('replay-staffroll').addEventListener('click', playStaffRoll);

    let cheatCodeBuffer = null, cheatTimeout;
    document.addEventListener("keydown", e => {
        // (省略) 既存のロジックは変更なし
        if (e.target.closest("input, textarea") || document.querySelector(".modal-overlay.visible")) return;
        if (e.key === "Enter") { e.preventDefault(); document.getElementById('fake-translator').classList.toggle("hidden"); cheatCodeBuffer = null; return; }
        if (e.key === " " || e.code === "Space") { e.preventDefault(); cheatCodeBuffer = ""; clearTimeout(cheatTimeout); cheatTimeout = setTimeout(() => { cheatCodeBuffer = null; }, 3000); return; }
        if (null !== cheatCodeBuffer) {
            if (e.key.length === 1) { cheatCodeBuffer += e.key.toLowerCase(); }
            if ("reset" === cheatCodeBuffer) {
                if (confirm("設定をリセットしますか？ (年齢設定や利用規約の同意状況などが初期化されます)")) {
                    ["tutorialCompleted", "termsAgreed", "notificationLastShown", "sokohara-site-user-id", "theme", "userAge"].forEach(e => localStorage.removeItem(e));
                    Object.keys(localStorage).forEach(key => { if (key.startsWith('surveyAnswered-')) { localStorage.removeItem(key); } });
                    alert("リセットしました。ページをリロードします。");
                    window.location.reload();
                }
                cheatCodeBuffer = null; clearTimeout(cheatTimeout);
            }
        }
    });
    
    window.addEventListener("beforeunload", () => goOffline(true));
    document.addEventListener('visibilitychange', handleVisibilityChange);
    ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => document.addEventListener(event, resetInactivityTimer));

    document.getElementById('translator-input').addEventListener("input",(e)=>{document.getElementById('translator-output').value=e.target.value.toLowerCase().split("").map(c=>({a:"あ",i:"い",u:"う",e:"え",o:"お"," ":"　"})[c]||c).join("")});
    document.querySelectorAll('nav a[data-target]').forEach(link => { link.addEventListener('click', (event) => { const targetId = event.currentTarget.dataset.target; document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active')); document.getElementById(`content-${targetId}`).classList.add('active'); }); });
    
    const itemListContainer = document.getElementById('item-list');
    function generateItemCards() {
        // (省略) 既存のロジックは変更なし
        itemListContainer.innerHTML = '';
        items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-card';
            itemElement.dataset.itemId = index;
            itemElement.dataset.category = item.category;
            const recommendBadge = item.recommend ? `<div class="recommend-badge">${item.recommend}</div>` : '';
            const ribbon = `<div class="ribbon ${item.category}">${item.category==='fun'?'楽しいやつ':item.category==='study'?'学習':'その他'}</div>`;
            itemElement.innerHTML = `${recommendBadge}<div class="thumbnail-container"><img src="${item.thumbnail}" alt="${item.title}" loading="lazy" onerror="this.parentElement.innerHTML = '<div style=\'display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);\'>画像なし</div>';"></div>${ribbon}<div class="item-card-content"><h3 class="item-card-title">${item.title}</h3><p class="item-card-desc">${item.description}</p></div>`;
            itemListContainer.appendChild(itemElement);
        });
    }

    const filterButtons = document.querySelectorAll('.category-btn');
    function filterItems(category) {
        // (省略) 既存のロジックは変更なし
        document.querySelectorAll('.item-card').forEach((card, index) => {
            const shouldShow = category === 'all' || card.dataset.category === category;
            card.style.display = shouldShow ? 'flex' : 'none';
            if (shouldShow) {
                card.style.animation = 'none';
                void card.offsetHeight;
                card.style.animation = `card-appear 0.5s ease-out ${index * 50}ms forwards`;
            }
        });
    }
    filterButtons.forEach(button => { button.addEventListener('click', () => { filterButtons.forEach(btn => btn.classList.remove('active')); button.classList.add('active'); filterItems(button.dataset.category); }); });

    const allModals = { details: document.getElementById('details-modal'), share: document.getElementById('share-modal'), update: document.getElementById('update-info-modal'), schedule: document.getElementById('schedule-modal'), notification: document.getElementById('notification-modal') };
    document.getElementById('show-update-info-btn').addEventListener('click',()=>allModals.update.classList.add('visible'));
    document.getElementById('show-schedule-btn').addEventListener('click',()=>allModals.schedule.classList.add('visible'));
    
    let currentItemUrl = '';
    itemListContainer.addEventListener('click', function(e) {
        // (省略) 既存のロジックは変更なし
        const card = e.target.closest('.item-card');
        if (card) {
            const item = items[card.dataset.itemId];
            if (item.url==='#'){alert('この作品は現在作成中です。お楽しみに！');return}
            currentItemUrl = item.url;
            document.getElementById('details-modal-title').textContent = item.title;
            document.getElementById('details-modal-img').src = item.thumbnail;
            document.getElementById('details-modal-desc').textContent = item.description;
            document.getElementById('details-modal-launch-btn').href = item.url;
            allModals.details.classList.add('visible');
        }
    });

    function openShareModal(title, url) {
        // (省略) 既存のロジックは変更なし
        document.getElementById("share-modal-title").textContent = title;
        document.getElementById("share-url-input").value = url;
        const qrContainer = document.getElementById("qrcode");
        qrContainer.innerHTML = "";
        QRCode.toCanvas(url, { width: 220, errorCorrectionLevel: "H" }, (error, canvas) => {
            if (error) { console.error(error); qrContainer.innerHTML = "<p>QRコード生成失敗</p>"; }
            else { qrContainer.appendChild(canvas); }
        });
        allModals.share.classList.add("visible");
    }

    document.getElementById("details-modal-share-btn").addEventListener("click", () => { const absoluteUrl = new URL(currentItemUrl, window.location.href).href; openShareModal("作品を共有", absoluteUrl); allModals.details.classList.remove("visible"); });
    document.getElementById("share-site-btn").addEventListener("click", () => { openShareModal("このサイトを共有", window.location.href); });
    document.getElementById("copy-url-btn").addEventListener("click", e => { navigator.clipboard.writeText(document.getElementById('share-url-input').value).then(() => { e.target.textContent = "コピー完了!"; setTimeout(() => { e.target.textContent = "コピー" }, 2000); }); });
    document.querySelectorAll("[data-close-modal]").forEach(btn => btn.addEventListener("click", () => btn.closest(".modal-overlay").classList.remove("visible")));
    document.querySelectorAll(".modal-overlay").forEach(modal => modal.addEventListener("click", e => { if (e.target === modal && modal.id !== 'survey-modal') { modal.classList.remove("visible"); } }));
    
    // --- サイト起動 ---
    generateCountdownCards();
    populateDynamicContent();
    generateItemCards();
    filterItems('fun');
    initSiteFlow();
});
