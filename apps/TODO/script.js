document.addEventListener('DOMContentLoaded', () => {
    // --- グローバルDOM要素 ---
    const contentArea = document.getElementById('content-area');
    const viewTitle = document.getElementById('view-title');
    const modal = document.getElementById('task-modal');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');
    const navLinks = document.querySelectorAll('.nav-link');
    const addTaskBtnMain = document.getElementById('add-task-btn-main');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const taskForm = document.getElementById('task-form');
    const deleteTaskBtn = document.getElementById('delete-task-btn');

    // --- データ管理 ---
    let tasks, events, timetable, colorSettings;
    let currentEditingTaskId = null;
    let clockInterval = null;

    const initializeData = () => {
        const defaultColorSettings = [
            { id: 1, name: '課題', color: '#ffb74d' },
            { id: 2, name: '提出物', color: '#ff8a65' },
            { id: 3, name: '暗記・復習', color: '#ba68c8' },
            { id: 4, name: 'テスト', color: '#e57373' },
            { id: 5, name: '予定', color: '#4fc3f7' },
            { id: 6, name: '個人', color: '#aed581' },
            { id: 7, name: 'その他', color: '#90a4ae' }
        ];

        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        events = JSON.parse(localStorage.getItem('events')) || [];
        timetable = JSON.parse(localStorage.getItem('timetable')) || { '月':[],'火':[],'水':[],'木':[],'金':[], '土':[], '日':[] };
        colorSettings = JSON.parse(localStorage.getItem('colorSettings')) || defaultColorSettings;
        
        if (!localStorage.getItem('colorSettings')) {
            saveData();
        }
    };

    const saveData = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('events', JSON.stringify(events));
        localStorage.setItem('timetable', JSON.stringify(timetable));
        localStorage.setItem('colorSettings', JSON.stringify(colorSettings));
    };

    // --- テーマ管理 ---
    const applyTheme = (theme) => {
        document.body.dataset.theme = theme;
        localStorage.setItem('theme', theme);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.checked = theme === 'dark';
    };

    // --- ルーティング & ビュー管理 ---
    const routes = {
        'dashboard': { title: 'ダッシュボード', render: renderDashboard, init: initDashboard },
        'tasks': { title: 'タスク一覧', render: renderTasks, init: initTasks },
        'calendar': { title: 'カレンダー', render: renderCalendar, init: initCalendar },
        'timetable': { title: '時間割', render: renderTimetable, init: initTimetable },
        'settings': { title: '設定', render: renderSettings, init: initSettings }
    };

    const navigate = () => {
        clearInterval(clockInterval);
        const hash = window.location.hash || '#dashboard';
        const viewName = hash.substring(1).split('?')[0];
        
        const route = routes[viewName] || routes['dashboard'];
        viewTitle.textContent = route.title;
        contentArea.innerHTML = route.render();
        route.init();
        
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.view === viewName));
    };
    
    // --- 各ビューのHTMLテンプレートを返す関数 ---
    function renderDashboard() {
        return `
        <div class="dashboard-top-grid">
            <div class="dashboard-header">
                <div id="dashboard-clock-date" class="dashboard-clock-date"></div>
                <div id="dashboard-clock-time" class="dashboard-clock-time"></div>
            </div>
            <div class="card"><h3>🏫 今日の時間割</h3><div id="dashboard-timetable-container" class="dashboard-timetable-grid"></div></div>
        </div>
        <div class="dashboard-grid">
            <div class="card"><h3>🌟 重要イベント (20日以内)</h3><div id="event-countdown-container" class="countdown-grid"></div></div>
            <div class="card"><h3>🚀 近いタスク</h3><div id="task-countdown-container" class="countdown-grid"></div></div>
            <div class="card"><h3>🗓️ 今日のタスク</h3><ul id="today-tasks-list" class="task-list-mini"></ul></div>
        </div>`;
    }
    function renderTasks() { return `<div id="task-list-container"></div>`; }
    function renderCalendar() { return `<div class="card"><div class="calendar-header"><button id="prev-month-btn">＜</button><h3 id="calendar-month-year"></h3><button id="next-month-btn">＞</button></div><div id="calendar-grid"></div></div>`; }
    function renderTimetable() { return `<div class="card"><div id="timetable-display-container"></div></div>`; }
    function renderSettings() {
        return `
        <div class="card"><h3>🎨 テーマ設定</h3><div class="setting-item"><span>ダークテーマ</span><label class="theme-switch"><input type="checkbox" id="theme-toggle"><span class="slider"></span></label></div></div>
        <div class="card"><h3>🌟 重要イベント設定</h3><div id="event-list"></div><form id="event-form" style="display:flex; gap:10px; margin-top:15px;"><input type="text" id="event-name" placeholder="イベント名" required><input type="date" id="event-date" required><button type="submit" class="submit-btn">追加</button></form></div>
        <div class="card"><h3>🌈 色のカテゴリ設定</h3><div id="color-category-list"></div><form id="color-category-form" style="display:flex; gap:10px; margin-top:15px;"><input type="text" id="category-name" placeholder="カテゴリ名" required><input type="color" id="category-color" value="#a78bfa"><button type="submit" class="submit-btn">追加</button></form></div>
        <div class="card"><h3>🏫 時間割設定</h3><div id="timetable-setting-container"></div><button id="save-timetable-btn" class="submit-btn" style="margin-top:15px;">保存</button></div>
        <div class="card"><h3>📥 iCalendar (.ics) インポート</h3><p>カレンダーアプリから書き出した.icsファイルを読み込めます。</p><input type="file" id="ics-import-input" accept=".ics"><button id="ics-import-btn" class="submit-btn" style="margin-top:10px;">インポート</button></div>
        <div class="card"><h3>⚙️ アプリケーション設定</h3><button id="clear-cache-btn">全データ（キャッシュ）を削除</button></div>`;
    }
    
    // --- 各ビューの初期化関数 ---
    function initDashboard() { updateClock(); clockInterval = setInterval(updateClock, 1000); const now = new Date(); const eventContainer = document.getElementById('event-countdown-container'); const twentyDaysLater = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000); const upcomingEvents = events.filter(e => new Date(e.date) >= now && new Date(e.date) <= twentyDaysLater).sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0, 5); eventContainer.innerHTML = upcomingEvents.length > 0 ? upcomingEvents.map(event => `<div class="countdown-item"><h4>${event.name}</h4><div class="countdown-timer" data-date="${event.date}"></div></div>`).join('') : '<p>20日以内の重要イベントはありません。</p>'; const taskContainer = document.getElementById('task-countdown-container'); const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); const upcomingTasks = tasks.filter(t => !t.completed && new Date(t.startDate) >= now && new Date(t.startDate) <= sevenDaysLater).sort((a,b) => new Date(a.startDate) - new Date(b.startDate)).slice(0, 3); taskContainer.innerHTML = upcomingTasks.length > 0 ? upcomingTasks.map(task => `<div class="countdown-item"><h4>${task.title}</h4><div class="countdown-timer" data-date="${task.startDate}"></div></div>`).join('') : '<p>1週間以内に開始するタスクはありません。</p>'; updateCountdowns(); const todayTasksList = document.getElementById('today-tasks-list'); const today = now.toISOString().split('T')[0]; const todayTasks = tasks.filter(t => !t.completed && today >= t.startDate && today <= t.endDate); todayTasksList.innerHTML = todayTasks.length > 0 ? todayTasks.map(task => { const category = colorSettings.find(cs => cs.id === task.categoryId); return `<li><span class="color-dot" style="background-color: ${category?.color || '#ccc'};"></span>${task.title}</li>`; }).join('') : '<li>今日のタスクはありません。</li>'; const timetableContainer = document.getElementById('dashboard-timetable-container'); const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()]; const todayTimetable = timetable[dayOfWeek] || []; timetableContainer.innerHTML = todayTimetable.some(subject => subject) ? todayTimetable.map((subject, index) => subject ? `<div class="dashboard-timetable-item"><div class="period">${index + 1}限</div><div class="subject">${subject}</div></div>` : '').join('') : '<p>今日の時間割は登録されていません。</p>'; }
    function initTasks() { const container = document.getElementById('task-list-container'); container.innerHTML = tasks.length > 0 ? tasks.sort((a,b) => new Date(a.startDate) - new Date(b.startDate)).map(task => { const category = colorSettings.find(cs => cs.id === task.categoryId); const dateDisplay = task.startDate === task.endDate ? task.startDate : `${task.startDate} ~ ${task.endDate}`; return `<div class="task-item ${task.completed ? 'completed' : ''}" style="border-color:${category?.color || '#ccc'}" data-id="${task.id}"><input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}><div class="task-details"><div class="task-title-text">${task.title}</div><div class="task-due-date">期間: ${dateDisplay}</div></div></div>`; }).join('') : '<div class="card">タスクはまだありません。</div>'; container.addEventListener('click', handleTaskClick); }
    let calendarDate = new Date();
    function initCalendar() { document.getElementById('prev-month-btn').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() - 1); renderCalendarGrid(); }); document.getElementById('next-month-btn').addEventListener('click', () => { calendarDate.setMonth(calendarDate.getMonth() + 1); renderCalendarGrid(); }); renderCalendarGrid(); }
    function initTimetable() { const container = document.getElementById('timetable-display-container'); const days = ['月', '火', '水', '木', '金']; let tableHTML = '<table><tr><th></th><th>1限</th><th>2限</th><th>3限</th><th>4限</th><th>5限</th><th>6限</th></tr>'; days.forEach(day => { tableHTML += `<tr><th>${day}</th>`; for(let i=0; i<6; i++){ tableHTML += `<td>${timetable[day]?.[i] || ''}</td>`; } tableHTML += `</tr>`; }); tableHTML += '</table>'; container.innerHTML = tableHTML; }
    function initSettings() { const themeToggle = document.getElementById('theme-toggle'); themeToggle.checked = localStorage.getItem('theme') === 'dark'; themeToggle.addEventListener('change', (e) => applyTheme(e.target.checked ? 'dark' : 'light')); renderEventList(); document.getElementById('event-form').addEventListener('submit', handleAddEvent); renderColorCategories(); document.getElementById('color-category-form').addEventListener('submit', handleAddCategory); renderTimetableSettings(); document.getElementById('save-timetable-btn').addEventListener('click', handleSaveTimetable); document.getElementById('ics-import-btn').addEventListener('click', handleIcsImport); document.getElementById('clear-cache-btn').addEventListener('click', handleClearCache); }
    
    // --- サブ関数群 ---
    function updateClock() { const dateEl = document.getElementById('dashboard-clock-date'); const timeEl = document.getElementById('dashboard-clock-time'); if(!dateEl || !timeEl) { clearInterval(clockInterval); return; } const now = new Date(); const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()]; dateEl.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 (${dayOfWeek})`; timeEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`; }
    function renderCalendarGrid() { const grid = document.getElementById('calendar-grid'); if (!grid) return; grid.innerHTML = ''; const year = calendarDate.getFullYear(); const month = calendarDate.getMonth(); document.getElementById('calendar-month-year').textContent = `${year}年 ${month + 1}月`; const firstDayOfMonth = new Date(year, month, 1); let startDate = new Date(firstDayOfMonth); startDate.setDate(startDate.getDate() - startDate.getDay()); ['日', '月', '火', '水', '木', '金', '土'].forEach(day => grid.innerHTML += `<div class="day-name">${day}</div>`); let currentDate = new Date(startDate); for(let i = 0; i < 42; i++){ const dayDiv = document.createElement('div'); const dateStr = currentDate.toISOString().split('T')[0]; dayDiv.className = 'day'; if (currentDate.getMonth() !== month) dayDiv.classList.add('other-month'); if (dateStr === new Date().toISOString().split('T')[0]) dayDiv.classList.add('today'); dayDiv.innerHTML = `<div class="day-number">${currentDate.getDate()}</div><div class="calendar-tasks"></div>`; const tasksContainer = dayDiv.querySelector('.calendar-tasks'); tasks.filter(t => dateStr >= t.startDate && dateStr <= t.endDate).forEach(task => { const category = colorSettings.find(cs => cs.id === task.categoryId); tasksContainer.innerHTML += `<div class="calendar-task-item" style="--color: ${category?.color || '#ccc'}">${task.title.substring(0, 7)}${task.title.length > 7 ? '…' : ''}</div>`; }); grid.appendChild(dayDiv); currentDate.setDate(currentDate.getDate() + 1); } }
    function renderColorCategories() { const list = document.getElementById('color-category-list'); if (!list) return; list.innerHTML = colorSettings.map(cat => `<div class="category-item"><input type="color" value="${cat.color}" data-id="${cat.id}" class="color-edit-input"><span>${cat.name}</span><button class="delete-category-btn" data-id="${cat.id}"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg></button></div>`).join(''); list.addEventListener('click', (e) => { const deleteBtn = e.target.closest('.delete-category-btn'); if (deleteBtn) { const id = Number(deleteBtn.dataset.id); if (colorSettings.length === 1) { alert('最後のカテゴリは削除できません。'); return; } if (confirm('このカテゴリを削除しますか？')) { colorSettings = colorSettings.filter(c => c.id !== id); tasks.forEach(t => { if(t.categoryId === id) t.categoryId = null; }); saveData(); renderColorCategories(); } } }); list.addEventListener('input', (e) => { if (e.target.classList.contains('color-edit-input')) { const id = Number(e.target.dataset.id); const category = colorSettings.find(c => c.id === id); if (category) { category.color = e.target.value; saveData(); } } }); }
    function handleAddCategory(e) { e.preventDefault(); const nameInput = document.getElementById('category-name'); const colorInput = document.getElementById('category-color'); colorSettings.push({ id: Date.now(), name: nameInput.value, color: colorInput.value }); saveData(); renderColorCategories(); nameInput.value = ''; colorInput.value = '#a78bfa'; }
    
    function handleIcsImport() {
        const fileInput = document.getElementById('ics-import-input');
        if (fileInput.files.length === 0) { alert('ファイルを選択してください。'); return; }
        const classificationKeywords = {
            event: ['集会', '式', '旅行', '遠足', '大会', '面談', '説明会', '修学旅行', '体育祭', '文化祭', '発表会', 'コンクール'],
            test: ['テスト', '試験', '考査', '模試', '英検', '漢検', '受験'],
            submission: ['提出', 'レポート'],
            assignment: ['課題', 'ワーク', 'ドリル', '問題集', 'プリント', '宿題', 'まとめ', 'ノート', '調べ学習'],
            appointment: ['塾', '病院', '歯医者', '習い事', '部活', '面接'],
            memory: ['暗記', '単語', '覚える'],
            review: ['復習', '見直し', '解き直し'],
            personal: ['買い物', '予約', '用事']
        };
        const getCategoryId = (categoryName) => { const category = colorSettings.find(c => c.name === categoryName); return category ? category.id : colorSettings.find(c => c.name === 'その他')?.id; };
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
                let match; let importedTasks = 0; let importedEvents = 0;
                while ((match = eventRegex.exec(content)) !== null) {
                    const eventData = match[1];
                    const titleMatch = /SUMMARY:(.*)/.exec(eventData);
                    const startMatch = /DTSTART(?:;[^:]+)?:(\d{8})/.exec(eventData);
                    const endMatch = /DTEND(?:;[^:]+)?:(\d{8})/.exec(eventData);
                    if (titleMatch && startMatch) {
                        const title = titleMatch[1].trim();
                        const parseDate = (dateStr) => new Date(Date.UTC(dateStr.substring(0,4), dateStr.substring(4,6) - 1, dateStr.substring(6,8)));
                        const startDate = parseDate(startMatch[1].trim());
                        const endDate = endMatch ? new Date(parseDate(endMatch[1].trim()).getTime() - (24*60*60*1000)) : startDate;
                        let isEvent = classificationKeywords.event.some(kw => title.includes(kw)) || classificationKeywords.test.some(kw => title.includes(kw));
                        if (isEvent) {
                            events.push({ id: Date.now() + Math.random(), name: title, date: startDate.toISOString().split('T')[0] });
                            importedEvents++;
                        } else {
                            let categoryId;
                            if(classificationKeywords.submission.some(kw => title.includes(kw))) categoryId = getCategoryId('提出物');
                            else if(classificationKeywords.assignment.some(kw => title.includes(kw))) categoryId = getCategoryId('課題');
                            else if(classificationKeywords.appointment.some(kw => title.includes(kw))) categoryId = getCategoryId('予定');
                            else if(classificationKeywords.memory.some(kw => title.includes(kw)) || classificationKeywords.review.some(kw => title.includes(kw))) categoryId = getCategoryId('暗記・復習');
                            else if(classificationKeywords.personal.some(kw => title.includes(kw))) categoryId = getCategoryId('個人');
                            else categoryId = getCategoryId('その他');
                            tasks.push({ id: Date.now() + Math.random(), title: title, startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0], categoryId: categoryId, completed: false, memo: '' });
                            importedTasks++;
                        }
                    }
                }
                if (importedTasks > 0 || importedEvents > 0) { saveData(); alert(`インポート完了：\nイベント: ${importedEvents}件\nタスク: ${importedTasks}件`); navigate(); } 
                else { alert('有効なイベントが見つかりませんでした。'); }
            } catch (error) { console.error(error); alert('ファイルの読み込み中にエラーが発生しました。'); }
        };
        reader.readAsText(fileInput.files[0]);
    }
    
    function renderEventList() { const list = document.getElementById('event-list'); list.innerHTML = events.map(event => `<div class="event-item"><span><strong>${event.name}</strong> (${event.date})</span><button class="delete-event-btn" data-id="${event.id}"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg></button></div>`).join(''); list.querySelectorAll('.delete-event-btn').forEach(btn => btn.addEventListener('click', (e) => { const id = Number(e.currentTarget.dataset.id); events = events.filter(ev => ev.id !== id); saveData(); renderEventList(); })); }
    function handleAddEvent(e) { e.preventDefault(); const nameInput = document.getElementById('event-name'); const dateInput = document.getElementById('event-date'); events.push({ id: Date.now(), name: nameInput.value, date: dateInput.value }); saveData(); renderEventList(); nameInput.value = ''; dateInput.value = ''; }
    function renderTimetableSettings() { const container = document.getElementById('timetable-setting-container'); const days = ['月', '火', '水', '木', '金']; let tableHTML = '<table><tr><th></th><th>1限</th><th>2限</th><th>3限</th><th>4限</th><th>5限</th><th>6限</th></tr>'; days.forEach(day => { tableHTML += `<tr><th>${day}</th>`; for(let i=0; i<6; i++){ tableHTML += `<td><input type="text" data-day="${day}" data-period="${i}" value="${timetable[day]?.[i] || ''}"></td>`; } tableHTML += `</tr>`; }); tableHTML += '</table>'; container.innerHTML = tableHTML; }
    function handleSaveTimetable() { const days = ['月', '火', '水', '木', '金']; days.forEach(day => { timetable[day] = []; for(let i=0; i<6; i++){ const input = document.querySelector(`input[data-day="${day}"][data-period="${i}"]`); timetable[day].push(input.value); } }); saveData(); alert('時間割を保存しました。'); }
    function handleClearCache() { if(confirm('本当にすべてのデータを削除しますか？この操作は元に戻せません。')) { localStorage.clear(); initializeData(); saveData(); alert('すべてのデータが削除されました。'); window.location.reload(); } }
    
    // --- モーダル & タスク処理 ---
    function openModal(taskId = null) {
        taskForm.reset(); populateCategorySelect(); const typeSingle = document.getElementById('task-type-single'); const typePeriod = document.getElementById('task-type-period'); const startDateInput = document.getElementById('task-start-date'); const endDateInput = document.getElementById('task-end-date'); const endDateWrapper = document.getElementById('task-end-date-wrapper'); const startDateLabel = document.getElementById('task-start-date-label');
        if (taskId) {
            currentEditingTaskId = taskId; const task = tasks.find(t => t.id === taskId); document.getElementById('modal-title').textContent = 'タスクを編集'; document.getElementById('task-id').value = task.id; document.getElementById('task-title').value = task.title; document.getElementById('task-memo').value = task.memo; startDateInput.value = task.startDate; endDateInput.value = task.endDate; document.getElementById('task-category').value = task.categoryId; deleteTaskBtn.style.display = 'block';
            if(task.startDate === task.endDate) { typeSingle.checked = true; endDateWrapper.style.display = 'none'; startDateLabel.textContent = '日付'; } 
            else { typePeriod.checked = true; endDateWrapper.style.display = 'block'; startDateLabel.textContent = '開始日'; }
        } else { currentEditingTaskId = null; document.getElementById('modal-title').textContent = 'タスクを追加'; typeSingle.checked = true; endDateWrapper.style.display = 'none'; startDateLabel.textContent = '日付'; deleteTaskBtn.style.display = 'none'; }
        modal.style.display = 'block';
    }
    taskForm.addEventListener('change', (e) => {
        if(e.target.name === 'task-type') { const endDateWrapper = document.getElementById('task-end-date-wrapper'); const startDateLabel = document.getElementById('task-start-date-label');
            if(e.target.value === 'period') { endDateWrapper.style.display = 'block'; startDateLabel.textContent = '開始日'; } 
            else { endDateWrapper.style.display = 'none'; startDateLabel.textContent = '日付'; }
        }
    });
    function populateCategorySelect() { const select = document.getElementById('task-category'); select.innerHTML = colorSettings.map(cs => `<option value="${cs.id}">${cs.name}</option>`).join(''); }
    taskForm.addEventListener('submit', (e) => { e.preventDefault(); const isPeriod = document.getElementById('task-type-period').checked; const startDate = document.getElementById('task-start-date').value; const endDate = isPeriod ? document.getElementById('task-end-date').value : startDate; if(isPeriod && startDate > endDate) { alert('終了日は開始日より後に設定してください。'); return; } const taskData = { id: currentEditingTaskId || Date.now(), title: document.getElementById('task-title').value, memo: document.getElementById('task-memo').value, startDate: startDate, endDate: endDate, categoryId: Number(document.getElementById('task-category').value), completed: currentEditingTaskId ? tasks.find(t=>t.id === currentEditingTaskId).completed : false, }; if (currentEditingTaskId) { tasks = tasks.map(t => t.id === currentEditingTaskId ? { ...tasks.find(t=>t.id===currentEditingTaskId), ...taskData } : t); } else { tasks.push(taskData); } saveData(); closeModal(); navigate(); });
    deleteTaskBtn.addEventListener('click', () => { if (!currentEditingTaskId || !confirm('このタスクを本当に削除しますか？')) return; tasks = tasks.filter(t => t.id !== currentEditingTaskId); saveData(); closeModal(); navigate(); });
    function handleTaskClick(e) { const taskItem = e.target.closest('.task-item'); if (!taskItem) return; const taskId = Number(taskItem.dataset.id); if (e.target.classList.contains('task-checkbox')) { const task = tasks.find(t => t.id === taskId); if(task) { task.completed = e.target.checked; saveData(); initTasks(); } } else { openModal(taskId); } }
    
    function updateCountdowns() {
        document.querySelectorAll('.countdown-timer').forEach(timer => {
            const distance = new Date(timer.dataset.date + 'T23:59:59').getTime() - new Date().getTime();
            if (distance < 0) { timer.textContent = "期間終了"; return; }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if (days > 0) { timer.textContent = `あと ${days}日と${hours}時間`; }
            else if (hours > 0) { timer.textContent = `あと ${hours}時間`; }
            else { timer.textContent = '本日'; }
        });
    }
    const closeModal = () => modal.style.display = 'none';

    // --- 初期化 & グローバルイベントリスナー ---
    initializeData();
    applyTheme(localStorage.getItem('theme') || 'light');
    window.addEventListener('hashchange', navigate);
    navigate();
    addTaskBtnMain.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    hamburgerMenu.addEventListener('click', () => sidebar.classList.toggle('open'));
    contentArea.addEventListener('click', () => { if (window.innerWidth <= 768 && sidebar.classList.contains('open')) sidebar.classList.remove('open'); });
    navLinks.forEach(link => link.addEventListener('click', () => { if (window.innerWidth <= 768) sidebar.classList.remove('open'); }));
});