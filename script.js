// ===============================================
// ▲▲▲ 必ず設定してください ▲▲▲
// ===============================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyU27oTz6Nt65kkF7nLu_r9KSFiCZP0CqwvTzlCBcegweEcvs65W2Wco_NKcX3G9k1_/exec';

// ===============================================
// 簡単更新エリア（見やすく整形しました）
// ===============================================

// --- お知らせモーダルの設定 ---
const notificationData = {
    title: "【重要】ちょっとGPT有料化について",
    text: "これまで無料で提供予定だった当AIサービスですが、運営体制の都合により、#月額制の有料サービスとして提供することになりました。#突然の変更となり申し訳ございません。<br>ライトプラン：月額 80円<br><br>スタンダードプラン：月額 110円<br><br>プレミアムプラン：月額 250円<br><br>できるだけ安く提供できるよう赤字覚悟でやっております。何卒よろしくお願いいたします。<br>",
    closeDelaySeconds: 0,
    showOncePerDay: false 
};

// --- アップデート情報の設定 ---
const updateInfoData = {
    history: [
        { 
            version: "v2.1", 
            date: "2025-10-20", 
            title: "ブロック落としにCPU(人工知能)が追加！", 
            details: [
                "新しい対戦モード「CPUチャレンジ」を追加しました。",
                "AIの思考ルーチンを改善し、より手強くなりました。",
                "軽微なバグを修正しました。",
            ],
            video: "cpu.mp4" 
        },
        { 
            version: "v2.0", 
            date: "2025-10-15", 
            title: "新デザインとカウントダウン機能", 
            details: [
                "サイトのデザインを全面的にリニューアルしました。",
                "各種カウントダウン機能を追加しました。",
                "パフォーマンスの改善を行いました。",
            ],
            video: null 
        }
    ],
    future: [
        "ブロックトレーニングにCPUを追加予定",
        "果物集めにもCPUを追加予定",
        "リンゴクリッカーを追加予定"
    ]
};

// --- 実装予定日の設定 ---
const scheduleData = [
    { name: "ジオメタリートレーニング", date: "10月23日" },
    { name: "3Dトレーニング", date: "11月7日" },
    { name: "ちょっとGPT", date: "11月30日" },
    { name: "7番出口", date: "12月25日" },
    { name: "リンゴクリッカー", date: "10月11日" },
    { name: "時計", date: "明日" }
];

// --- 作品リストの設定 ---
const items = [
    {
        title: "ブロック落とし",
        description: "CPUと対戦できるブロック落とし！あなたは勝てるか！？",
        thumbnail: "./apps/app10/thumbnail.jpeg",
        url: "./apps/app10/index.html",
        recommend: "一番頑張った",
        category: "fun"
    },
    {
        title: "ブロックトレーニング",
        description: "同じ色のブロックをそろえて消そう！連鎖が気持ちいい！",
        thumbnail: "./apps/app2/thumbnail.png",
        url: "./apps/app2/index.html",
        recommend: "一番人気！",
        category: "fun"
    },
    {
        title: "果物集め",
        description: "大きな果物を作ろう！人気のスイカゲーム風の楽しいやつ。",
        thumbnail: "./apps/app3/thumbnail.png",
        url: "./apps/app3/index.html",
        recommend: null,
        category: "fun"
    },
    {
        title: "提出物共有カレンダー",
        description: "提出物の期限をみんなで共有・管理できるカレンダー。これで提出忘れもなし！",
        thumbnail: "学習.png",
        url: "https://calendar.google.com/calendar/u/0?cid=Y184OTcwNjUzMGZkZWQ1MGRhMjdhYTE0MmEyNTJmMmVjMzU3NTMxNGY2YTk3NjA5MzcyN2VlODg2MTQ3NDkxYmU5QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20",
        recommend: "協力しよう",
        category: "study"
    },
    {
        title: "ジオメタリートレーニング",
        description: "リズムに合わせてジャンプ！シンプルな操作性がクセになる、早期アクセスバージョン。",
        thumbnail: "./apps/app5/thumbnail.png",
        url: "./apps/app5/index.html",
        recommend: "早期アクセス",
        category: "fun"
    },
    {
        title: "ちょっとGPT",
        description: "高性能な対話プログラムとおしゃべり。宿題の相談から雑談まで、君は何を話す？",
        thumbnail: "./apps/app9/thumbnail.png",
        url: "#",
        recommend: "調整中",
        category: "other"
    },
    {
        title: "待ち針のやつ",
        description: "回転する円に針を刺していく、シンプルながらも奥が深いタイミングゲーム。",
        thumbnail: "./apps/app6/thumbnail.png",
        url: "./apps/app6/index.html",
        recommend: null,
        category: "fun"
    },
    {
        title: "ボール移動",
        description: "ボールをゴールまで導こう。意外なところに落とし穴があるかも…？",
        thumbnail: "./apps/app4/thumbnail.png",
        url: "./apps/app4/index.html",
        recommend: null,
        category: "fun"
    },
    {
        title: "3Dトレーニング",
        description: "三次元空間で頭を鍛える新しい体験。完成までもう少し待っててね！",
        thumbnail: "./apps/app7/thumbnail.png",
        url: "#",
        recommend: "作成中",
        category: "fun"
    },
    {
        title: "7番出口",
        description: "不思議な地下通路を探索する作品。異変を見逃さないで。現在工事中。",
        thumbnail: "./apps/app8/thumbnail.png",
        url: "#",
        recommend: "工事中",
        category: "fun"
    }
];

// ===============================================
// 簡単更新エリアここまで
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
    // --- 要素取得 ---
    const loader = document.getElementById('loader');
    const siteWrapper = document.getElementById('site-wrapper');
    const onlineCountDisplay = document.getElementById('online-count-display');
    const themeToggle = document.getElementById('theme-toggle');
    const staffRollContainer = document.getElementById('staffRollContainer');
    const welcomeContainer = document.getElementById('welcome-animation-container');

    let staffRollTimer, countdownInterval;
    const clientId = Date.now().toString(36) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

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
        } catch (error) { console.error('GAS通信エラー:', error); }
    }

    function populateDynamicContent() {
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

    // --- サイト初期化 & テーマ設定 ---
    function applyTheme(theme) {
        document.body.dataset.theme = theme;
        themeToggle.checked = theme === 'light';
    }
    
    function initSiteFlow() {
        const savedTheme = localStorage.getItem('theme') || 'dark'; // デフォルトはdark
        applyTheme(savedTheme);
        playStaffRoll();
    }
    
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    function afterStaffRoll() {
        callGas('accessStart', { clientId, userId });
        const tutorialCompleted = localStorage.getItem('tutorialCompleted');
        if (!tutorialCompleted) { 
            runTutorial(() => checkTermsAndStart()); 
        } 
        else { 
            checkTermsAndStart(); 
        }
    }

    // --- チュートリアル ---
    function runTutorial(callback) {
        const modal = document.getElementById("tutorial-modal");
        const steps = modal.querySelectorAll(".tutorial-step");
        const nextBtn = document.getElementById("tutorial-next-btn");
        const prevBtn = document.getElementById("tutorial-prev-btn");
        const skipBtn = document.getElementById("tutorial-skip-btn");
        const indicator = document.getElementById("tutorial-step-indicator");
        let currentStep = 0;
        const totalSteps = steps.length;

        function updateStep() {
            steps.forEach((step, index) => {
                step.classList.toggle("active", index === currentStep);
            });
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

        nextBtn.addEventListener("click", () => {
            if (currentStep < totalSteps - 1) {
                currentStep++;
                updateStep();
            } else {
                completeTutorial();
            }
        });

        prevBtn.addEventListener("click", () => {
            if (currentStep > 0) {
                currentStep--;
                updateStep();
            }
        });
        
        skipBtn.addEventListener("click", completeTutorial);
        
        modal.classList.add("visible");
        document.body.classList.add("no-scroll");
        updateStep();
    }

    // --- 利用規約と年齢確認 ---
    function checkTermsAndStart() {
        const termsAgreed = localStorage.getItem("termsAgreed");
        if (!termsAgreed) {
            const termsModal = document.getElementById("terms-modal");
            termsModal.classList.add("visible");
            document.body.classList.add("no-scroll");

            document.getElementById("terms-agree-btn").addEventListener("click", () => {
                localStorage.setItem("termsAgreed", "true");
                termsModal.classList.remove("visible");
                document.body.classList.remove("no-scroll");
                promptForAgeAndStart();
            }, { once: true });
        } else {
            promptForAgeAndStart();
        }
    }

    function promptForAgeAndStart() {
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
    }

    async function updateOnlineCount() {
        try {
            const data = await callGas('getOnlineCount');
            onlineCountDisplay.textContent = (data && typeof data.onlineCount === 'number') ? `${data.onlineCount} 人` : '-- 人';
        } catch (error) { onlineCountDisplay.textContent = 'エラー'; }
    }
    
    function startSite(age) {
        startCountdown(age);
        showMainContent();
        updateOnlineCount();
        setInterval(updateOnlineCount, 15000);
    }

    // --- カウントダウン機能 ---
    const countdownMessages = ["この時間の何時間を遊びに使うのでしょうか？", "残り時間は、わずかです。", "時は金なり。有効に使おう。", "今日という日は、残りの人生の最初の一日。"];
    function startCountdown(age) {
        const els = { 
            timer: document.getElementById('countdown-timer'), 
            message: document.getElementById('countdown-message'), 
            test: document.getElementById('test-countdown-timer'), 
            birthday: document.getElementById('birthday-countdown-timer'), 
            trip: document.getElementById('school-trip-countdown-timer'), 
            chorus: document.getElementById('chorus-countdown-timer'),
            endCeremony: document.getElementById('end-ceremony-countdown-timer') // 追加
        };
        const birthYear = new Date().getFullYear() - age;
        const targetDate = new Date(birthYear + 90, new Date().getMonth(), new Date().getDate());
        
        function updateLifeCountdown() {
            const rem = targetDate - new Date();
            if (rem < 0) {
                els.timer.textContent = "目標達成！";
                return;
            }
            const s = Math.floor(rem / 1000 % 60),
                  m = Math.floor(rem / 60000 % 60),
                  h = Math.floor(rem / 3600000 % 24),
                  d = Math.floor(rem / 86400000),
                  w = Math.floor(d / 7);
            els.timer.innerHTML = `${w}<span>週</span> ${d % 7}<span>日</span> ${h}<span>時間</span> ${m}<span>分</span> ${s}<span>秒</span>`;
        }

        function updateDaysCountdown() {
            const now = new Date(), y = now.getFullYear();
            const getDiff = (targetDate) => {
                if (now > targetDate) return { text: "終了", days: -1 };
                const days = Math.ceil((targetDate - now) / 86400000);
                return { text: `${days} 日`, days: days };
            };
            const updateElement = (el, date) => {
                if(!el) return;
                const result = getDiff(date);
                el.textContent = result.text;
                el.classList.toggle('warning', result.days > 0 && result.days <= 30);
            };
            
            updateElement(els.test, new Date(y, 10, 18)); // 11月18日
            updateElement(els.chorus, new Date(y, 9, 31)); // 10月31日
            updateElement(els.trip, new Date(2026, 0, 16)); // 2026年1月16日
            updateElement(els.endCeremony, new Date(2026, 2, 19)); // 2026年3月19日 (月は0から始まる)
            
            let bday = new Date(y, 3, 6); 
            if (now > bday) bday.setFullYear(y + 1);
            updateElement(els.birthday, bday);
        }

        const updateAll = () => { updateLifeCountdown(); updateDaysCountdown(); };
        updateAll(); 
        clearInterval(countdownInterval);
        countdownInterval = setInterval(updateAll, 1000);

        els.message.textContent = countdownMessages[Math.floor(Math.random() * countdownMessages.length)];
        setInterval(() => { els.message.textContent = countdownMessages[Math.floor(Math.random() * countdownMessages.length)]; }, 10000);
    }
    
    // --- スタッフロールとサイト表示 ---
    function playStaffRoll() {
        const credits = staffRollContainer.querySelector(".credits-list");
        if (credits) {
            const newCredits = credits.cloneNode(true);
            staffRollContainer.innerHTML = '';
            staffRollContainer.appendChild(newCredits);
        }
        document.body.classList.add("no-scroll");
        loader.classList.remove("fade-out");
        staffRollContainer.style.opacity = '1';
        welcomeContainer.style.display = 'none';

        const skipBtn = document.getElementById('skipBtn');
        skipBtn.style.display = 'block';
        skipBtn.onclick = () => { clearTimeout(staffRollTimer); onStaffRollEnd(); };

        siteWrapper.classList.remove("visible");
        clearTimeout(staffRollTimer);
        staffRollTimer = setTimeout(onStaffRollEnd, 25000); // アニメーション時間に合わせて調整
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
                welcomeContainer.innerHTML = ''; // クリア
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
                }, text.length * 100 + 2000); // アニメーション時間 + 待機時間
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
        
        if (!notificationData.showOncePerDay || lastShown !== today) {
            const modal = document.getElementById("notification-modal");
            const closeBtn = document.getElementById("notification-close-btn");
            setTimeout(() => {
                modal.classList.add("visible");
                if (notificationData.showOncePerDay) {
                    localStorage.setItem("notificationLastShown", today);
                }
                let delay = notificationData.closeDelaySeconds || 0;
                closeBtn.disabled = true;
                if (delay > 0) {
                    closeBtn.textContent = `閉じる (${delay})`;
                    const countdown = setInterval(() => {
                        delay--;
                        if (delay > 0) {
                            closeBtn.textContent = `閉じる (${delay})`;
                        } else {
                            clearInterval(countdown);
                            closeBtn.disabled = false;
                            closeBtn.textContent = "閉じる";
                        }
                    }, 1000);
                } else {
                    closeBtn.disabled = false;
                    closeBtn.textContent = "閉じる";
                }
            }, 500);
        }
    }

    document.getElementById('replay-staffroll').addEventListener('click', playStaffRoll);

    // --- キーボードイベント & ページ離脱 ---
    let cheatCodeBuffer = null, cheatTimeout;
    document.addEventListener("keydown", e => {
        if (e.target.closest("input, textarea") || document.querySelector(".modal-overlay.visible")) return;
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById('fake-translator').classList.toggle("hidden");
            cheatCodeBuffer = null;
            return;
        }
        if (e.key === " " || e.code === "Space") {
            e.preventDefault();
            cheatCodeBuffer = "";
            clearTimeout(cheatTimeout);
            cheatTimeout = setTimeout(() => { cheatCodeBuffer = null; }, 3000);
            return;
        }
        if (null !== cheatCodeBuffer) {
            if (e.key.length === 1) {
                cheatCodeBuffer += e.key.toLowerCase();
            }
            if ("reset" === cheatCodeBuffer) {
                if (confirm("設定をリセットしますか？ (年齢設定や利用規約の同意状況などが初期化されます)")) {
                    ["tutorialCompleted", "termsAgreed", "notificationLastShown", "sokohara-site-user-id", "theme", "userAge"].forEach(e => localStorage.removeItem(e));
                    alert("リセットしました。ページをリロードします。");
                    window.location.reload();
                }
                cheatCodeBuffer = null;
                clearTimeout(cheatTimeout);
            }
        }
    });
    
    const sendLeaveBeacon = () => {
        if (navigator.sendBeacon) {
            const data = JSON.stringify({ action: "accessEnd", payload: { clientId } });
            navigator.sendBeacon(GAS_URL, new Blob([data], { type: "text/plain; charset=UTF-8" }));
        }
    };
    window.addEventListener("beforeunload", sendLeaveBeacon);

    document.getElementById('translator-input').addEventListener("input",(e)=>{document.getElementById('translator-output').value=e.target.value.toLowerCase().split("").map(c=>({a:"あ",i:"い",u:"う",e:"え",o:"お"," ":"　"})[c]||c).join("")});

    // --- ナビゲーションタブ切り替え ---
    document.querySelectorAll('nav a[data-target]').forEach(link => { link.addEventListener('click', (event) => { const targetId = event.currentTarget.dataset.target; document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active')); document.getElementById(`content-${targetId}`).classList.add('active'); }); });

    // --- 作品カードの動的生成とフィルター ---
    const itemListContainer = document.getElementById('item-list');
    function generateItemCards() {
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

    // --- モーダル関連 ---
    const allModals = { details: document.getElementById('details-modal'), share: document.getElementById('share-modal'), update: document.getElementById('update-info-modal'), schedule: document.getElementById('schedule-modal'), notification: document.getElementById('notification-modal') };
    document.getElementById('show-update-info-btn').addEventListener('click',()=>allModals.update.classList.add('visible'));
    document.getElementById('show-schedule-btn').addEventListener('click',()=>allModals.schedule.classList.add('visible'));
    
    let currentItemUrl = '';
    itemListContainer.addEventListener('click', function(e) {
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
        document.getElementById("share-modal-title").textContent = title;
        document.getElementById("share-url-input").value = url;
        const qrContainer = document.getElementById("qrcode");
        qrContainer.innerHTML = "";
        QRCode.toCanvas(url, { width: 220, errorCorrectionLevel: "H" }, (error, canvas) => {
            if (error) {
                console.error(error);
                qrContainer.innerHTML = "<p>QRコード生成失敗</p>";
            } else {
                qrContainer.appendChild(canvas);
            }
        });
        allModals.share.classList.add("visible");
    }

    document.getElementById("details-modal-share-btn").addEventListener("click", () => {
        const absoluteUrl = new URL(currentItemUrl, window.location.href).href;
        openShareModal("作品を共有", absoluteUrl);
        allModals.details.classList.remove("visible");
    });
    
    document.getElementById("share-site-btn").addEventListener("click", () => {
        openShareModal("このサイトを共有", window.location.href);
    });
    
    document.getElementById("copy-url-btn").addEventListener("click", e => {
        navigator.clipboard.writeText(document.getElementById('share-url-input').value).then(() => {
            e.target.textContent = "コピー完了!";
            setTimeout(() => { e.target.textContent = "コピー" }, 2000);
        });
    });

    document.querySelectorAll("[data-close-modal]").forEach(btn => btn.addEventListener("click", () => btn.closest(".modal-overlay").classList.remove("visible")));
    document.querySelectorAll(".modal-overlay").forEach(modal => modal.addEventListener("click", e => {
        if (e.target === modal) {
            modal.classList.remove("visible");
        }
    }));
    
    // --- サイト起動 ---
    populateDynamicContent();
    generateItemCards();
    filterItems('fun');
    initSiteFlow();
});
