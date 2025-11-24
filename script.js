// ===============================================
// ▲▲▲ 必ず設定してください ▲▲▲
// ===============================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzJSO_Bq80Qc1UI8RNyKBJ2Az81QfFkqdO-0j9nLglrEkirg-69sxYfPdGMbq9l30AO/exec'; 

// ===============================================
// データ定義
// ===============================================

const adBanners = [
    { image: '/広告枠/image1.jpeg', link: 'https://ocearyagroup.vercel.app/' },
    { image: '/広告枠/image2.jpeg', link: 'https://example.com/2' }
];

let notificationData = { title: "", text: "", active: false };
let updateInfoData = { history: [], future: [] }; 
let scheduleData = [];
let surveyData = { id: "default_survey", question: "", options: [] };

const countdownConfig = [
    { label: "人生終了まで", type: "life", span: "full" },
    { label: "期末テストまで", date: "2026/02/16" },
    { label: "クリスマスまで", date: "2025/12/25" },
    { label: "修学旅行まで", date: "2026/01/16" },
    { label: "修了式まで", date: "2026/03/19" },
    { label: "とわの誕生日まで", date: "04/06" },
    { label: "現在のアクセス人数", type: "online" }
];

const items = [
    { title: "ブロック落とし", description: "CPUと対戦できるブロック落とし！", thumbnail: "./apps/app10/thumbnail.jpeg", url: "./apps/app10/index.html", recommend: "一番頑張った", category: "fun" },
    { title: "ブロックトレーニング", description: "同じ色のブロックをそろえて消そう！", thumbnail: "./apps/app2/thumbnail.png", url: "./apps/app2/index.html", recommend: "一番人気！", category: "fun" },
    { title: "果物集め", description: "大きな果物を作ろう！", thumbnail: "./apps/app3/thumbnail.png", url: "./apps/app3/index.html", recommend: null, category: "fun" },
    { title: "学習プランナー Pro", description: "提出物の期限を管理できるカレンダー。", thumbnail: "./apps/外部URL用写真/学習.png", url: "./apps/TODO/index.html", recommend: "GOOD", category: "study" },
    { title: "ジオメタリートレーニング", description: "リズムに合わせてジャンプ！", thumbnail: "./apps/app5/thumbnail.png", url: "./apps/app5/index.html", recommend: "早期アクセス", category: "fun" },
    { title: "ちょっとGPT", description: "高性能な対話プログラムとおしゃべり。", thumbnail: "./apps/app9/thumbnail.png", url: "#", recommend: "調整中", category: "other" },
    { title: "待ち針のやつ", description: "回転する円に針を刺していくやつ。", thumbnail: "./apps/app6/thumbnail.png", url: "./apps/app6/index.html", recommend: null, category: "fun" },
    { title: "ボール移動", description: "意外と人気！！", thumbnail: "./apps/app4/thumbnail.png", url: "./apps/app4/index.html", recommend: null, category: "fun" },
    { title: "3Dトレーニング", description: "三次元空間で頭を鍛える新しい体験。", thumbnail: "./apps/app7/thumbnail.jpeg", url: "#", recommend: "作成中", category: "fun" },
    { title: "7番出口", description: "不思議な地下通路を探索する作品。", thumbnail: "./apps/app8/thumbnail.png", url: "./apps/app8/index.html", recommend: "工事中", category: "fun" },
    { title: "砂ブロック落とし", description: "最近流行ってるあれ", thumbnail: "./apps/app12/thumbnail.jpeg", url: "#", recommend: "作成中", category: "fun" },
    { title: "ブロック崩し", description: "グーグルのねあれよあれ", thumbnail: "./apps/app13/thumbnail.jpeg", url: "#", recommend: "作成中", category: "fun" },
    { title: "パズルブロック", description: "まあ、楽しくない", thumbnail: "./apps/app14/thumbnail.jpeg", url: "#", recommend: "作成中", category: "fun" },
    { title: "キャンディークリッカー", description: "暇つぶし", thumbnail: "./apps/app16/thumbnail.jpeg", url: "#", recommend: "作成中", category: "fun" },
    { title: "My Wallet", description: "初の本格ウェブアプリ。", thumbnail: "./apps/外部URL用写真/マイウォレット.png", url: "https://towabii.github.io/mywallet/", recommend: "PWA対応！", category: "other" },
    { title: "管理パネル", description: "開発者のみアクセス。", thumbnail: "./apps/外部URL用写真/NOIMAGE.jpeg", url: "https://towabii.github.io/kanri/", recommend: "管理者のみ", category: "other" },
    { title: "トワの部屋BOX検索", description: "開発者のみアクセス。", thumbnail: "./apps/外部URL用写真/NOIMAGE.jpeg", url: "https://towabii.github.io/SmartBOX/", recommend: "管理者のみ", category: "other" },
];

document.addEventListener('DOMContentLoaded', function() {
    const loader = document.getElementById('loader');
    const siteWrapper = document.getElementById('site-wrapper');
    const banScreen = document.getElementById('ban-screen');
    const themeToggle = document.getElementById('theme-toggle');
    const staffRollContainer = document.getElementById('staffRollContainer');
    const creditsPre = document.getElementById('credits-text');
    const welcomeContainer = document.getElementById('welcome-animation-container');
    
    // ローディングUI要素
    const loadingStatusContainer = document.getElementById('loading-status-container');
    const loadingText = document.getElementById('loading-text');
    const progressBarFill = document.getElementById('progress-bar-fill');

    let staffRollTimer, countdownInterval, typingInterval, adTimer;
    const clientId = Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
    const INACTIVITY_TIMEOUT = 3600 * 1000;
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
    const headerUserIdEl = document.getElementById('header-user-id');
    if (headerUserIdEl) headerUserIdEl.textContent = `ID: ${userId}`;

    async function callGas(action, payload = {}) {
        try {
            if (!GAS_URL || GAS_URL.includes('貼り付け')) throw new Error('GASのURL設定エラー');
            const response = await fetch(GAS_URL, { 
                method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                body: JSON.stringify({ action, payload })
            });
            const result = await response.json();
            if (result.status === 'error') throw new Error(result.message);
            return result.data;
        } catch (error) { 
            console.error('GAS通信エラー:', error);
            throw error;
        }
    }

    function goOnline() {
        if (isOnline) return;
        isOnline = true;
        resetInactivityTimer();
    }
    function goOffline() {
        if (!isOnline) return;
        isOnline = false;
        clearTimeout(inactivityTimer);
        callGas('accessEnd', { userId, clientId }).catch(()=>{});
    }
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => goOffline(), INACTIVITY_TIMEOUT);
    }
    function handleVisibilityChange() {
        if (document.hidden) goOffline(); else goOnline();
    }

    function showBanScreen(adminMessage) {
        siteWrapper.style.display = 'none';
        siteWrapper.classList.remove('visible');
        banScreen.classList.add('visible');
        document.getElementById('ban-user-id-display').textContent = userId;
        document.getElementById('ban-admin-message').innerHTML = adminMessage ? adminMessage.replace(/\n/g, '<br>') : 'メッセージはありません。';
        document.getElementById('ban-feedback-btn').addEventListener('click', () => {
            document.getElementById('fb-ban-appeal').checked = true;
            openFeedbackModal();
        });
    }

    function updateLoadingStatus(message, percent) {
        loadingText.textContent = message;
        progressBarFill.style.width = percent + '%';
    }

    async function fetchAndApplySiteData() {
        try {
            const data = await callGas('getSiteData');
            
            notificationData.title = data.config.notificationTitle || "";
            notificationData.text = data.config.notificationText || "";
            notificationData.active = (String(data.config.notificationActive).toLowerCase() === 'true');
            
            surveyData.id = data.config.surveyId || ("survey_" + Date.now()); 
            surveyData.question = data.config.surveyQuestion || "";
            surveyData.options = data.config.surveyOptions ? data.config.surveyOptions.split(',').map(s => s.trim()) : [];

            updateInfoData.history = data.updates || [];
            scheduleData = data.schedule || [];

            populateDynamicContent();

        } catch (e) {
            console.warn("設定データの取得に失敗。デフォルト値を使用します。", e);
        }
    }

    function populateDynamicContent() {
        const notificationTitle = document.getElementById('notification-title');
        const notificationText = document.getElementById('notification-text');
        if (notificationTitle) notificationTitle.textContent = notificationData.title;
        if (notificationText) notificationText.innerHTML = notificationData.text;

        const updateContentContainer = document.getElementById('update-info-content');
        if (updateContentContainer) {
            updateContentContainer.innerHTML = '';
            updateInfoData.history.forEach(update => {
                const item = document.createElement('div'); item.className = 'update-item';
                const detailsHtml = update.details.map(detail => `<li>${detail}</li>`).join('');
                const videoHtml = update.video ? `<video class="update-video" src="${update.video}" autoplay muted loop playsinline></video>` : '';
                item.innerHTML = `<div class="update-header"><span class="update-version">${update.version}</span><h4 class="update-title">${update.title}</h4><span class="update-date">${update.date}</span></div><ul class="update-details">${detailsHtml}</ul>${videoHtml}`;
                updateContentContainer.appendChild(item);
            });
        }

        const scheduleList = document.getElementById('schedule-list');
        if (scheduleList) {
            scheduleList.innerHTML = '';
            scheduleData.forEach(item => {
                const li = document.createElement('li');
                li.style.cssText = "display: flex; justify-content: space-between; padding: 0.8rem 0; border-bottom: 1px solid var(--border-color);";
                li.innerHTML = `<span>${item.name}</span> <span style="color: var(--text-secondary);">${item.date}</span>`;
                scheduleList.appendChild(li);
            });
        }

        const gameSelect = document.getElementById('fb-game');
        if (gameSelect) {
            gameSelect.innerHTML = '<option value="なし">特になし</option>';
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.title;
                option.textContent = item.title;
                gameSelect.appendChild(option);
            });
        }
    }

    async function updateOnlineCount() {
        try {
            const data = await callGas('getOnlineCount');
            const display = document.getElementById('online-count-display');
            if (display) {
                display.textContent = (data && typeof data.onlineCount === 'number') ? `${data.onlineCount} 人` : '-- 人';
            }
        } catch (e) {}
    }

    async function afterStaffRoll() {
        staffRollContainer.style.display = 'none';
        document.getElementById('skipBtn').style.display = 'none';
        welcomeContainer.style.display = 'none'; 
        loadingStatusContainer.style.display = 'flex';

        try {
            updateLoadingStatus("サーバーに接続中...", 10);
            updateLoadingStatus("設定データを取得中...", 40);
            await fetchAndApplySiteData();
            updateLoadingStatus("ユーザーデータを照会中...", 70);
            const accessData = await callGas('accessStart', { userId, clientId });
            updateLoadingStatus("準備完了", 100);

            setTimeout(() => {
                loader.classList.add('fade-out');
                
                if (accessData.status === 'BANNED') { 
                    showBanScreen(accessData.message); 
                    return; 
                }
                
                document.body.classList.remove("no-scroll");
                siteWrapper.classList.add("visible");
                goOnline();
                
                // 強制的に「楽しいやつ」でフィルタリング
                const allBtns = document.querySelectorAll('.category-btn');
                const funBtn = document.querySelector('.category-btn[data-category="fun"]');
                allBtns.forEach(btn => btn.classList.remove('active'));
                if (funBtn) {
                    funBtn.classList.add('active');
                    filterItems('fun');
                } else {
                    filterItems('fun');
                }
                
                const tutorialCompleted = localStorage.getItem('tutorialCompleted');
                const afterTutorial = () => checkTermsAndStart(() => {
                    if (accessData.message) {
                        showNotification("管理者からのお知らせ", accessData.message);
                    } else if (notificationData.active) {
                        showNotification(notificationData.title, notificationData.text);
                    }
                    checkAndShowSurvey();
                });

                if (!tutorialCompleted) runTutorial(afterTutorial); else afterTutorial();

                updateOnlineCount();
                setInterval(updateOnlineCount, 60000);

            }, 500);
            
        } catch (error) {
            console.error("Init Error:", error);
            alert("通信エラーが発生しました。再読み込みしてください。");
            loadingText.textContent = "エラーが発生しました";
        }
    }

    function showNotification(title, text) {
        if(!title && !text) return;
        document.getElementById('notification-title').textContent = title;
        document.getElementById('notification-text').innerHTML = text;
        document.getElementById("notification-modal").classList.add("visible");
    }

    function checkAndShowSurvey() {
        if (!surveyData.question || surveyData.options.length === 0) return;
        const key = 'surveyAnswered-' + surveyData.id;
        if (localStorage.getItem(key) === 'true') return;

        const modal = document.getElementById("survey-modal");
        document.getElementById("survey-question").textContent = surveyData.question;
        const container = document.getElementById("survey-options-container");
        container.innerHTML = '';
        surveyData.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'survey-option-btn';
            btn.textContent = opt;
            btn.onclick = () => {
                modal.classList.remove('visible');
                document.body.classList.remove("no-scroll");
                showToast('送信しました。');
                localStorage.setItem(key, 'true');
                callGas('submitSurvey', { userId, surveyId: surveyData.id, question: surveyData.question, answer: opt });
            };
            container.appendChild(btn);
        });
        modal.classList.add('visible');
        document.body.classList.add("no-scroll");
    }

    const feedbackModal = document.getElementById('feedback-modal');
    const feedbackForm = document.getElementById('feedback-form');
    const stars = document.querySelectorAll('#fb-rating span');
    const ratingInput = document.getElementById('fb-rating-value');

    function openFeedbackModal() {
        document.getElementById('fb-userid').value = userId;
        feedbackModal.classList.add('visible');
    }

    document.getElementById('open-feedback-btn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('fb-ban-appeal').checked = false;
        openFeedbackModal();
    });

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = star.dataset.value;
            ratingInput.value = val;
            stars.forEach(s => s.classList.toggle('active', s.dataset.value <= val));
        });
    });

    document.getElementById('fb-submit-btn').addEventListener('click', async () => {
        if(!feedbackForm.checkValidity()) {
            feedbackForm.reportValidity();
            return;
        }
        const submitBtn = document.getElementById('fb-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';

        const payload = {
            userId: document.getElementById('fb-userid').value,
            name: document.getElementById('fb-name').value,
            type: document.getElementById('fb-type').value,
            game: document.getElementById('fb-game').value,
            rating: ratingInput.value,
            banAppeal: document.getElementById('fb-ban-appeal').checked,
            content: document.getElementById('fb-content').value
        };

        try {
            await callGas('submitFeedback', payload);
            showToast('フィードバックを送信しました！');
            feedbackModal.classList.remove('visible');
            feedbackForm.reset();
            stars.forEach(s => s.classList.add('active'));
            ratingInput.value = 5;
        } catch (err) {
            alert('送信に失敗しました: ' + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '送信';
        }
    });

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
                valueHtml = `<div id="countdown-timer" class="countdown-value-large">--</div>`;
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

    function runTutorial(callback) {
        const modal = document.getElementById("tutorial-modal"); const steps = modal.querySelectorAll(".tutorial-step");
        const nextBtn = document.getElementById("tutorial-next-btn"); const prevBtn = document.getElementById("tutorial-prev-btn");
        const skipBtn = document.getElementById("tutorial-skip-btn"); const indicator = document.getElementById("tutorial-step-indicator");
        let currentStep = 0; const totalSteps = steps.length;
        function updateStep() {
            steps.forEach((step, index) => { step.classList.toggle("active", index === currentStep); });
            indicator.textContent = `${currentStep + 1} / ${totalSteps}`;
            prevBtn.style.visibility = (currentStep === 0) ? "hidden" : "visible";
            nextBtn.textContent = (currentStep === totalSteps - 1) ? "完了" : "次へ";
        }
        function completeTutorial() {
            localStorage.setItem("tutorialCompleted", "true"); modal.classList.remove("visible");
            document.body.classList.remove("no-scroll"); if (callback) callback();
        }
        nextBtn.addEventListener("click", () => { if (currentStep < totalSteps - 1) { currentStep++; updateStep(); } else { completeTutorial(); } });
        prevBtn.addEventListener("click", () => { if (currentStep > 0) { currentStep--; updateStep(); } });
        skipBtn.addEventListener("click", completeTutorial);
        modal.classList.add("visible"); document.body.classList.add("no-scroll"); updateStep();
    }
    function checkTermsAndStart(callback) {
        const termsAgreed = localStorage.getItem("termsAgreed");
        if (!termsAgreed) {
            const termsModal = document.getElementById("terms-modal");
            termsModal.classList.add("visible"); document.body.classList.add("no-scroll");
            document.getElementById("terms-agree-btn").addEventListener("click", () => {
                localStorage.setItem("termsAgreed", "true"); termsModal.classList.remove("visible");
                document.body.classList.remove("no-scroll"); promptForAgeAndStart(callback);
            }, { once: true });
        } else { promptForAgeAndStart(callback); }
    }
    function promptForAgeAndStart(callback) {
        let age = localStorage.getItem('userAge');
        if (!age) {
            let userInput = prompt("あなたの年齢を半角数字で入力してください。\n「人生終了まで」の計算に使用されます。", "14");
            if (userInput === null || isNaN(parseInt(userInput))) age = 14; else age = parseInt(userInput);
            localStorage.setItem('userAge', age);
        }
        startCountdown(parseInt(age)); if (callback) callback();
    }

    function startCountdown(age) {
        const birthYear = new Date().getFullYear() - age;
        const lifeTargetDate = new Date(birthYear + 90, new Date().getMonth(), new Date().getDate());
        const updateFunctions = []; 
        const lifeTimerEl = document.getElementById('countdown-timer');
        if (lifeTimerEl) {
            updateFunctions.push(() => {
                const rem = lifeTargetDate - new Date(); 
                if (rem < 0) { lifeTimerEl.textContent = "目標達成！"; return; }
                const s = Math.floor(rem / 1000 % 60), m = Math.floor(rem / 60000 % 60), h = Math.floor(rem / 3600000 % 24), d = Math.floor(rem / 86400000), w = Math.floor(d / 7);
                lifeTimerEl.innerHTML = `${w}<span>週</span> ${d % 7}<span>日</span> ${h}<span>時間</span> ${m}<span>分</span> ${s}<span>秒</span>`;
            });
        }
        countdownConfig.forEach((config, index) => {
            if (!config.date) return;
            const el = document.querySelector(`#countdown-card-${index} .countdown-value`);
            if(!el) return; 
            let targetDate; const now = new Date();
            const [month, day] = config.date.split('/').slice(-2).map(Number);
            if (config.date.includes('/')) {
                 targetDate = new Date(now.getFullYear(), month - 1, day); 
                 if (now > targetDate) targetDate.setFullYear(now.getFullYear() + 1);
            }
            updateFunctions.push(() => {
                const now = new Date(); 
                const days = Math.ceil((targetDate - now) / 86400000); 
                el.textContent = `${days} 日`;
                el.classList.toggle('warning', days > 0 && days <= 30);
            });
        });
        const updateAll = () => updateFunctions.forEach(fn => fn());
        updateAll(); clearInterval(countdownInterval); countdownInterval = setInterval(updateAll, 1000);
    }

    const originalCreditsText = creditsPre.innerHTML;
    function playStaffRoll() {
        const creditsContainer = staffRollContainer.querySelector(".credits-list");
        if (creditsContainer) { creditsContainer.style.animation = 'none'; void creditsContainer.offsetHeight; creditsContainer.style.animation = ''; }
        creditsPre.innerHTML = ''; document.body.classList.add("no-scroll");
        loader.classList.remove("fade-out"); 
        loadingStatusContainer.style.display = 'none';
        staffRollContainer.style.display = 'block'; 
        staffRollContainer.style.opacity = '1';
        welcomeContainer.style.display = 'none'; 
        const skipBtn = document.getElementById('skipBtn');
        skipBtn.style.display = 'block'; 
        const onSkip = () => { clearTimeout(staffRollTimer); clearInterval(typingInterval); onStaffRollEnd(); };
        skipBtn.onclick = onSkip; siteWrapper.classList.remove("visible"); 
        let charIndex = 0; const textToType = originalCreditsText.trim(); const cursor = '<span class="typing-cursor">█</span>';
        typingInterval = setInterval(() => {
            if (charIndex < textToType.length) { charIndex++; creditsPre.innerHTML = textToType.substring(0, charIndex) + cursor; }
            else { clearInterval(typingInterval); creditsPre.innerHTML = textToType + cursor; }
        }, 30);
        staffRollTimer = setTimeout(onStaffRollEnd, 40000);
    }
    
    function onStaffRollEnd() {
        if (loader.classList.contains('fade-out')) return;
        const tutorialCompleted = localStorage.getItem('tutorialCompleted');
        
        staffRollContainer.style.opacity = '0'; 
        document.getElementById('skipBtn').style.opacity = '0';
        clearInterval(typingInterval);

        if (!tutorialCompleted) {
             setTimeout(() => {
                staffRollContainer.style.display = 'none';
                welcomeContainer.style.display = 'flex'; welcomeContainer.innerHTML = ''; 
                "こんにちは".split('').forEach((char, i) => {
                    const span = document.createElement('span'); span.textContent = char; span.className = 'welcome-char';
                    span.style.animationDelay = `${i * 100}ms`; welcomeContainer.appendChild(span);
                    setTimeout(() => span.classList.add('animate'), 50);
                });
                setTimeout(() => { afterStaffRoll(); }, 2000);
            }, 500);
        } else { 
            setTimeout(() => { afterStaffRoll(); }, 500);
        }
    }
    document.getElementById('replay-staffroll').addEventListener('click', playStaffRoll);

    let toastTimer;
    function showToast(message) {
        const toast = document.getElementById('toast-notification');
        if (!toast) return; clearTimeout(toastTimer); toast.textContent = message;
        toast.classList.add('show');
        toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }

    document.addEventListener("keydown", e => {
        if (e.target.closest("input, textarea") || document.querySelector(".modal-overlay.visible:not(#ban-screen)")) return;
        if (e.key === "Enter") { 
            e.preventDefault(); 
            document.getElementById('fake-translator').classList.toggle("hidden"); 
        }
    });

    document.querySelectorAll('nav a[data-target]').forEach(link => { 
        link.addEventListener('click', (event) => { 
            const targetId = event.currentTarget.dataset.target; 
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active')); 
            document.getElementById(`content-${targetId}`).classList.add('active'); 
        }); 
    });

    const itemListContainer = document.getElementById('item-list');
    function generateItemCards() {
        itemListContainer.innerHTML = '';
        items.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-card'; itemElement.dataset.itemId = index; itemElement.dataset.category = item.category;
            const recommendBadge = item.recommend ? `<div class="recommend-badge">${item.recommend}</div>` : '';
            const ribbon = `<div class="ribbon ${item.category}">${item.category==='fun'?'楽しいやつ':item.category==='study'?'学習':'その他'}</div>`;
            itemElement.innerHTML = `${recommendBadge}<div class="thumbnail-container"><img src="${item.thumbnail}" alt="${item.title}" loading="lazy" onerror="this.parentElement.innerHTML = '<div style=\'display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);\'>No Image</div>';"></div>${ribbon}<div class="item-card-content"><h3 class="item-card-title">${item.title}</h3><p class="item-card-desc">${item.description}</p></div>`;
            itemListContainer.appendChild(itemElement);
        });
    }
    
    function filterItems(category) {
        let visibleCount = 0;
        document.querySelectorAll('.item-card').forEach((card) => {
            const shouldShow = category === 'all' || card.dataset.category === category;
            card.style.display = shouldShow ? 'flex' : 'none';
            if (shouldShow) { 
                card.style.animation = 'none'; 
                void card.offsetHeight; 
                card.style.animation = `card-appear 0.5s ease-out ${visibleCount * 50}ms forwards`; 
                visibleCount++;
            }
        });
    }

    const filterButtons = document.querySelectorAll('.category-btn');
    filterButtons.forEach(button => { 
        button.addEventListener('click', () => { 
            filterButtons.forEach(btn => btn.classList.remove('active')); 
            button.classList.add('active'); 
            filterItems(button.dataset.category);
        }); 
    });

    const allModals = { details: document.getElementById('details-modal'), share: document.getElementById('share-modal'), update: document.getElementById('update-info-modal'), schedule: document.getElementById('schedule-modal') };
    document.getElementById('show-update-info-btn').addEventListener('click',()=>allModals.update.classList.add('visible'));
    document.getElementById('show-schedule-btn').addEventListener('click',()=>allModals.schedule.classList.add('visible'));
    
    let currentItemUrl = '';
    itemListContainer.addEventListener('click', function(e) {
        const card = e.target.closest('.item-card');
        if (card) {
            const item = items[card.dataset.itemId];
            if (item.url==='#'){alert('作成中');return}
            currentItemUrl = item.url;
            document.getElementById('details-modal-title').textContent = item.title;
            document.getElementById('details-modal-img').src = item.thumbnail;
            document.getElementById('details-modal-desc').textContent = item.description;
            const launchBtn = document.getElementById('details-modal-launch-btn');
            launchBtn.href = item.url;
            launchBtn.onclick = () => callGas('logGamePlay', { userId, gameTitle: item.title }).catch(()=>{});
            allModals.details.classList.add('visible');
        }
    });

    // 【修正】画像パスを受け取れるように拡張
    function openShareModal(title, url, imagePath = null) {
        document.getElementById("share-modal-title").textContent = title;
        document.getElementById("share-url-input").value = url;
        const qrContainer = document.getElementById("qrcode"); qrContainer.innerHTML = "";
        
        if (imagePath) {
            // 画像指定がある場合は画像を表示 (QR.jpegなど)
            const img = document.createElement('img');
            img.src = imagePath;
            img.style.width = '220px';
            img.style.height = 'auto';
            img.alt = 'QR Code';
            qrContainer.appendChild(img);
        } else {
            // 画像指定がない場合（個別作品など）は動的にQRコードを生成
            if (typeof QRCode !== 'undefined') QRCode.toCanvas(url, { width: 220 }, (e, c) => { if(!e) qrContainer.appendChild(c); });
        }
        
        allModals.share.classList.add("visible");
    }

    document.getElementById("details-modal-share-btn").addEventListener("click", () => { openShareModal("作品を共有", new URL(currentItemUrl, window.location.href).href); allModals.details.classList.remove("visible"); });
    
    // 【修正】サイト共有ボタンは QR.jpeg を表示するように変更
    document.getElementById("share-site-btn").addEventListener("click", () => openShareModal("このサイトを共有", window.location.href, "QR.jpeg"));
    
    document.getElementById("copy-url-btn").addEventListener("click", e => { navigator.clipboard.writeText(document.getElementById('share-url-input').value).then(() => { e.target.textContent = "完了!"; setTimeout(() => e.target.textContent = "コピー", 2000); }); });
    document.querySelectorAll("[data-close-modal]").forEach(btn => btn.addEventListener("click", () => btn.closest(".modal-overlay").classList.remove("visible")));
    document.querySelectorAll(".modal-overlay").forEach(modal => modal.addEventListener("click", e => { if (e.target === modal && modal.id !== 'ban-screen') modal.classList.remove("visible"); }));

    document.getElementById('translator-input').addEventListener("input",(e)=>{document.getElementById('translator-output').value=e.target.value.toLowerCase().split("").map(c=>({a:"あ",i:"い",u:"う",e:"え",o:"お"," ":"　"})[c]||c).join("")});

    generateCountdownCards();
    generateItemCards();
    initSiteFlow();
});
