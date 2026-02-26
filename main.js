import * as XLSX from 'xlsx';

document.addEventListener('DOMContentLoaded', () => {
    // --- DATA MODELS ---
    const admins = [
        { id: 1, username: 'admin', password: 'password', role: 'super', companyId: null },
        { id: 2, username: 'companyA', password: 'password', role: 'company', companyId: 101 },
    ];

    const companies = [
        { id: 101, name: '씽씽' },
        { id: 102, name: '지쿠터' },
    ];
    let nextCompanyId = 103;

    let reports = [
        { id: 1, deviceId: 'S123', companyId: 101, status: 'received', date: '2024-05-23' },
        { id: 2, deviceId: 'G456', companyId: 102, status: 'moved', date: '2024-05-22' },
        { id: 3, deviceId: 'S789', companyId: 101, status: 'towed', date: '2024-05-21' },
        { id: 4, deviceId: 'S101', companyId: 101, status: 'received', date: '2024-04-28' },
        { id: 5, deviceId: 'G202', companyId: 102, status: 'moved', date: '2024-04-20' },
        { id: 6, deviceId: 'S303', companyId: 101, status: 'moved', date: '2024-04-15' },
    ];

    let currentUser = null;

    // --- UI ELEMENTS ---
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const mainContent = appContainer.querySelector('main');
    const bottomNav = appContainer.querySelector('.bottom-nav');
    const headerTitle = appContainer.querySelector('header h1');

    // --- LOGIN & UI INITIALIZATION (same as before) ---
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const user = admins.find(u => u.username === username && u.password === password);

        if (user) {
            currentUser = user;
            initializeAppUI();
        } else {
            const loginError = document.getElementById('login-error');
            loginError.textContent = '아이디 또는 비밀번호가 잘못되었습니다.';
            setTimeout(() => loginError.textContent = '', 3000);
        }
    });

    function initializeAppUI() {
        loginScreen.style.display = 'none';
        appContainer.style.display = 'block';
        buildNavigation();
        showScreen('dashboard');
    }

    function buildNavigation() {
        bottomNav.innerHTML = '';
        const navConfig = {
            super: [
                { id: 'dashboard', icon: 'fa-tachometer-alt', text: '대시보드' },
                { id: 'companies', icon: 'fa-building', text: '업체관리' },
                { id: 'reports', icon: 'fa-file-alt', text: '신고관리' },
                { id: 'stats', icon: 'fa-chart-pie', text: '통계' },
                { id: 'logout', icon: 'fa-sign-out-alt', text: '로그아웃' },
            ],
            company: [
                { id: 'dashboard', icon: 'fa-tachometer-alt', text: '대시보드' },
                { id: 'my-reports', icon: 'fa-file-alt', text: '내 신고' },
                { id: 'logout', icon: 'fa-sign-out-alt', text: '로그아웃' },
            ],
        };
        const userNav = navConfig[currentUser.role];
        userNav.forEach(item => {
            const navItem = document.createElement('a');
            navItem.href = '#';
            navItem.id = `nav-${item.id}`;
            navItem.classList.add('nav-item');
            navItem.innerHTML = `<i class="fas ${item.icon}"></i><span>${item.text}</span>`;
            navItem.addEventListener('click', (e) => {
                e.preventDefault();
                if (item.id === 'logout') logout();
                else showScreen(item.id);
            });
            bottomNav.appendChild(navItem);
        });
    }

    // --- SCREEN MANAGEMENT ---
    function showScreen(screenId) {
        mainContent.innerHTML = '';
        const navItem = document.getElementById(`nav-${screenId}`);
        if (navItem) {
            headerTitle.textContent = navItem.querySelector('span').textContent;
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            navItem.classList.add('active');
        }
        const screenRenderers = {
            dashboard: renderDashboard,
            companies: renderCompanyScreen,
            reports: renderReportScreen,
            stats: renderStatsScreen,
            'my-reports': renderMyReportsScreen,
        };
        if (screenRenderers[screenId]) screenRenderers[screenId]();
        else mainContent.innerHTML = `<p>페이지를 찾을 수 없습니다.</p>`;
    }

    // --- SCREEN RENDERERS ---
    function renderDashboard() { /* ... same as before ... */ }
    function renderCompanyScreen() { /* ... same as before ... */ }
    function renderReportScreen() { /* ... same as before ... */ }

    function renderStatsScreen() {
        const statsByMonth = reports.reduce((acc, report) => {
            const month = report.date.substring(0, 7); // YYYY-MM
            if (!acc[month]) {
                acc[month] = { total: 0, moved: 0, towed: 0 };
            }
            acc[month].total++;
            if (report.status === 'moved') acc[month].moved++;
            if (report.status === 'towed') acc[month].towed++;
            return acc;
        }, {});

        let tableHtml = `
            <section id="statistics">
                <div class="table-container">
                    <table id="stats-table">
                        <thead>
                            <tr>
                                <th>월</th>
                                <th>총 신고 건</th>
                                <th>PM 처리 건</th>
                                <th>견인 처리 건</th>
                            </tr>
                        </thead>
                        <tbody>`;

        for (const month in statsByMonth) {
            const data = statsByMonth[month];
            tableHtml += `
                <tr>
                    <td>${month}</td>
                    <td>${data.total}</td>
                    <td>${data.moved}</td>
                    <td>${data.towed}</td>
                </tr>`;
        }

        tableHtml += `</tbody></table></div></section>`;
        mainContent.innerHTML = tableHtml;
    }

    function renderMyReportsScreen() { mainContent.innerHTML = `<p>내 신고 보기 화면 (준비 중)</p>`; }

    // --- CRUD & Other Functions (addCompany, deleteCompany, downloadReportsAsExcel, logout) ---
    // ... (These functions remain the same as the previous version)
});

