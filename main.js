document.addEventListener('DOMContentLoaded', () => {
    // --- DATA MODELS ---
    const admins = [{ id: 1, username: 'admin', password: 'password', role: 'super' }];
    let companies = [
        { id: 101, name: '씽씽', prefix: 'S' }, 
        { id: 102, name: '지쿠터', prefix: 'G' }
    ];
    let reports = [
        { id: 1, deviceId: 'S123', companyId: 101, status: 'received', date: '2024-05-23', lat: 37.5665, lng: 126.9780, phone: '01012345678', photo: 'images/scooter-icon.png', content: '인도를 막고 있어요.' },
        { id: 2, deviceId: 'G456', companyId: 102, status: 'completed', date: '2024-05-22', lat: 37.5651, lng: 126.9770, phone: '01012345678', photo: 'images/scooter-icon.png', content: '횡단보도 위에 주차되어 있습니다.' },
        { id: 3, deviceId: 'S789', companyId: 101, status: 'towed', date: '2024-04-21', lat: 37.5600, lng: 126.9700, phone: '01087654321', photo: 'images/scooter-icon.png', content: '지하철역 입구를 막고 있습니다.' },
    ];
    let nextReportId = 4;
    let currentUser = null;
    let map, marker;

    // --- UI ELEMENTS ---
    const allScreens = document.querySelectorAll('main > section');
    const headerTitle = document.getElementById('header-title');
    const bottomNav = document.querySelector('.bottom-nav');

    // --- SCREEN & NAVIGATION LOGIC ---
    const showScreen = (screenId) => {
        allScreens.forEach(s => s.style.display = 'none');
        const screen = document.getElementById(screenId);
        if(screen) screen.style.display = 'block';
    };

    const updateNav = (role) => {
        bottomNav.innerHTML = '';
        let navConfig = [];

        if (role === 'user') {
            navConfig = [
                { id: 'home-screen', icon: 'fa-home', text: '홈' },
                { id: 'report-screen', icon: 'fa-bullhorn', text: '신고하기' },
                { id: 'check-status-screen', icon: 'fa-receipt', text: '신고확인' },
                { id: 'notice-screen', icon: 'fa-info-circle', text: '공지사항' }
            ];
        } else if (role === 'super') {
            navConfig = [
                { id: 'admin-dashboard-screen', icon: 'fa-tachometer-alt', text: '대시보드' },
                { id: 'admin-companies-screen', icon: 'fa-building', text: '업체 관리' },
                { id: 'admin-reports-screen', icon: 'fa-file-alt', text: '신고 관리' },
                { id: 'admin-stats-screen', icon: 'fa-chart-pie', text: '통계' },
                { id: 'logout', icon: 'fa-sign-out-alt', text: '로그아웃' },
            ];
        } else if (role === 'pm') {
             navConfig = [
                { id: 'admin-dashboard-screen', icon: 'fa-clipboard-list', text: '신고 목록' },
                { id: 'logout', icon: 'fa-sign-out-alt', text: '로그아웃' },
            ];
        } else if (role === 'towing') {
             navConfig = [
                { id: 'admin-dashboard-screen', icon: 'fa-truck', text: '견인 목록' },
                { id: 'logout', icon: 'fa-sign-out-alt', text: '로그아웃' },
            ];
        }

        navConfig.forEach(item => {
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'nav-item';
            a.dataset.screen = item.id;
            a.innerHTML = `<i class="fas ${item.icon}"></i><span>${item.text}</span>`;
            a.addEventListener('click', handleNavClick);
            bottomNav.appendChild(a);
        });
    };

    const handleNavClick = (e) => {
        e.preventDefault();
        const target = e.currentTarget;
        const screenId = target.dataset.screen;

        if (screenId === 'logout') { logout(); return; }

        headerTitle.textContent = target.querySelector('span').textContent;
        showScreen(screenId);

        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        target.classList.add('active');
        
        const userRenderers = {
            'report-screen': initMap,
            'check-status-screen': () => document.getElementById('report-list-container').innerHTML = '',
        };

        if (userRenderers[screenId]) {
            userRenderers[screenId]();
            return;
        }

        if (screenId.startsWith('admin')) {
             const renderers = {
                'admin-companies-screen': renderCompanyScreen,
                'admin-reports-screen': renderAdminReportList,
                'admin-stats-screen': renderStatsScreen,
            };
             if (renderers[screenId]) {
                renderers[screenId]();
            } else if (screenId === 'admin-dashboard-screen') {
                switch(currentUser.role) {
                    case 'pm': renderPmDashboard(); break;
                    case 'towing': renderTowingDashboard(); break;
                    case 'super': renderAdminDashboard(); break;
                }
            }
        }
    };

    const initApp = () => {
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            updateNav(currentUser.role);
            let initialScreen = 'admin-dashboard-screen';
            const initialNav = document.querySelector(`[data-screen="${initialScreen}"]`);
            if (initialNav) initialNav.click();
            else showScreen(initialScreen);
        } else {
            currentUser = null;
            updateNav('user');
            showScreen('home-screen');
            const homeNav = document.querySelector('[data-screen="home-screen"]');
            if(homeNav) homeNav.classList.add('active');
            headerTitle.textContent = '공유 모빌리티 신고';
        }
         document.querySelectorAll('#notice-list .notice-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement.classList.toggle('active');
            });
        });
    };

    const logout = () => {
        currentUser = null;
        sessionStorage.removeItem('currentUser');
        const detailScreen = document.getElementById('admin-detail-screen');
        if(detailScreen) detailScreen.remove();
        initApp(); 
    };

    // --- RENDER FUNCTIONS ---

    const createReportListHTML = (reportList) => {
         if (reportList.length === 0) return '<p class="empty-list-message">해당 내역이 없습니다.</p>';
        let listHtml = '<ul>';
        reportList.forEach(r => {
            const companyName = companies.find(c => c.id === r.companyId)?.name || '미배정';
            listHtml += `<li data-report-id="${r.id}" class="report-item-clickable">
                            <div class="report-item-info">
                                <strong>기기 ID: ${r.deviceId}</strong>
                                <span>${companyName} / ${r.date}</span>
                            </div>
                            <div class="report-item-status status-${r.status}">${r.status.replace('_', ' ')}</div>
                         </li>`;
        });
        listHtml += '</ul>';
        return listHtml;
    }

    const renderReportDetail = (reportId) => {
        const report = reports.find(r => r.id == reportId);
        if (!report) return;

        let detailScreen = document.getElementById('admin-detail-screen');
        if (!detailScreen) {
            detailScreen = document.createElement('section');
            detailScreen.id = 'admin-detail-screen';
            document.querySelector('main').appendChild(detailScreen);
        }
        
        headerTitle.textContent = `신고 #${report.id} 상세`;

        let content = `
            <button id="back-to-list-btn">&larr; 목록으로 돌아가기</button>
            <div class="detail-content">
                 <div id="admin-detail-info">
                    <h3>기본 정보</h3>
                    <p><strong>기기 ID:</strong> ${report.deviceId}</p>
                    <p><strong>신고 날짜:</strong> ${report.date}</p>
                    <p><strong>현재 상태:</strong> <span class="report-item-status status-${report.status}">${report.status.replace('_', ' ')}</span></p>
                </div>
                <div>
                    <h3>신고 내용</h3>
                    <p>${report.content || '내용 없음'}</p>
                    <h3>신고 사진</h3>
                    <img src="${report.photo}" alt="신고 사진" class="detail-photo">
                </div>
            </div>`;
        
        const roleActions = {
            'pm': `
                <div class="detail-actions">
                    <h3>처리 상태 변경</h3>
                    <form id="pm-update-form">
                        <textarea id="pm-action-content" placeholder="처리 내용을 입력하세요..."></textarea>
                        <label for="pm-action-photo">처리 후 사진 첨부</label>
                        <input type="file" id="pm-action-photo" accept="image/*">
                        <button type="button" data-status="completed">정비완료</button>
                        <button type="button" data-status="towed">견인 요청</button>
                    </form>
                </div>`,
            'towing': `
                <div class="detail-actions">
                    <h3>견인 완료 처리</h3>
                    <form id="towing-update-form">
                         <label for="towing-action-photo">견인 완료 사진</label>
                        <input type="file" id="towing-action-photo" accept="image/*">
                        <button type="button" data-status="towing_completed">견인 완료</button>
                    </form>
                </div>`,
        };

        content += roleActions[currentUser.role] || '';

        detailScreen.innerHTML = content;
        showScreen('admin-detail-screen');

        document.getElementById('back-to-list-btn').addEventListener('click', () => {
            detailScreen.remove(); 
            const activeNav = document.querySelector('.nav-item.active');
            if (activeNav) activeNav.click();
            else initApp(); // Fallback
        });

        detailScreen.querySelector('.detail-actions button')?.addEventListener('click', (e) => {
            const newStatus = e.target.dataset.status;
            if(newStatus) updateReportStatus(reportId, newStatus);
        });
    };

    const updateReportStatus = (reportId, newStatus) => {
        const report = reports.find(r => r.id == reportId);
        if (report) {
            report.status = newStatus;
            alert(`신고 #${reportId}의 상태가 '${newStatus.replace('_',' ')}'(으)로 변경되었습니다.`);
            document.getElementById('back-to-list-btn').click();
        }
    };

    // --- Admin Role Specific Renders ---
    const renderAdminDashboard = () => {
        const screen = document.getElementById('admin-dashboard-screen');
        screen.innerHTML = `<h2>총괄 대시보드</h2><p>환영합니다, ${currentUser.username}님.</p><p>현재 총 ${reports.length}건의 신고가 있습니다.</p>`;
    };

    const renderPmDashboard = () => {
        const screen = document.getElementById('admin-dashboard-screen');
        const companyReports = reports.filter(r => r.companyId === currentUser.companyId);
        const companyName = companies.find(c => c.id === currentUser.companyId)?.name || 'PM 업체';
        headerTitle.textContent = companyName; // Update header title

        let content = `
            <div class="pm-tabs">
                <button class="pm-tab-link active" data-status="received">신고</button>
                <button class="pm-tab-link" data-status="completed">정비완료</button>
                <button class="pm-tab-link" data-status="towed">견인</button>
            </div>
            <div id="pm-report-list" class="report-list-container"></div>`;
        screen.innerHTML = content;

        const renderListByStatus = (status) => {
            const listContainer = document.getElementById('pm-report-list');
            const filteredReports = companyReports.filter(r => r.status === status);
            listContainer.innerHTML = createReportListHTML(filteredReports);
            listContainer.querySelectorAll('.report-item-clickable').forEach(item => {
                item.addEventListener('click', () => renderReportDetail(item.dataset.reportId));
            });
        };

        screen.querySelectorAll('.pm-tab-link').forEach(tab => {
            tab.addEventListener('click', (e) => {
                screen.querySelectorAll('.pm-tab-link').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                renderListByStatus(e.target.dataset.status);
            });
        });
        renderListByStatus('received');
    };

    const renderTowingDashboard = () => {
        const screen = document.getElementById('admin-dashboard-screen');
        const towedReports = reports.filter(r => r.status === 'towed' || r.status === 'towing_completed');
        screen.innerHTML = `<div class="report-list-container">${createReportListHTML(towedReports)}</div>`;
        screen.querySelectorAll('.report-item-clickable').forEach(item => {
            item.addEventListener('click', () => renderReportDetail(item.dataset.reportId));
        });
    };

    const renderAdminReportList = () => {
        const screen = document.getElementById('admin-reports-screen');
        screen.innerHTML = `<div class="report-list-container">${createReportListHTML(reports)}</div>`;
        screen.querySelectorAll('.report-item-clickable').forEach(item => {
            item.addEventListener('click', () => renderReportDetail(item.dataset.reportId));
        });
    }

    const renderCompanyScreen = () => { 
        const screen = document.getElementById('admin-companies-screen');
        const companyList = companies.map(c => `<li>${c.name} (Prefix: ${c.prefix})</li>`).join('');
        screen.innerHTML = `<ul>${companyList}</ul>`;
    };
    const renderStatsScreen = () => { 
        const screen = document.getElementById('admin-stats-screen');
        screen.innerHTML = '<p>통계 기능은 현재 준비 중입니다.</p>';
     };
    
    // --- User Mode ---
    const initMap = () => {
        // ... map logic ...
    };

    initApp();
});
