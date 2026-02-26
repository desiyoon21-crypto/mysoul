document.addEventListener('DOMContentLoaded', () => {
    // --- Central Data Store ---
    let reports = [
        { id: 1, phoneNumber: '01012345678', deviceId: 'S12345', company: '씽씽', date: '2023-10-27', userPhoto: 'https://via.placeholder.com/400x300.png?text=User+Photo+1', status: 'received' },
        { id: 2, phoneNumber: '01012345678', deviceId: 'G67890', company: '지쿠터', date: '2023-10-26', userPhoto: 'https://via.placeholder.com/400x300.png?text=User+Photo+2', status: 'received' }
    ];
    let nextReportId = 3;

    // --- UI Elements ---
    const screens = {
        home: document.getElementById('home-screen'),
        step1: document.getElementById('step1-device-info'),
        step2: document.getElementById('step2-detailed-report'),
        success: document.getElementById('success-message'),
        checkStatus: document.getElementById('check-status-screen'),
        notice: document.getElementById('notice-screen'),
        adminList: document.getElementById('admin-list-screen'),
        adminDetail: document.getElementById('admin-detail-screen')
    };

    const navItems = {
        home: document.getElementById('nav-home'),
        report: document.getElementById('nav-report'),
        check: document.getElementById('nav-check'),
        notice: document.getElementById('nav-notice'),
        admin: document.getElementById('nav-admin')
    };
    
    const statusMap = {
        received: { text: '접수', class: 'status-received' },
        moved: { text: '기기이동', class: 'status-moved' },
        completed: { text: '처리완료', class: 'status-completed' },
        rejected: { text: '반려', class: 'status-rejected' }
    };

    // --- Screen & Navigation Logic ---
    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.style.display = 'none');
        screens[screenName].style.display = 'block';
        
        Object.values(navItems).forEach(item => item.classList.remove('active'));
        const activeNav = Object.keys(navItems).find(key => screenName.startsWith(key));
        if (activeNav) navItems[activeNav].classList.add('active');
        if (screenName === 'adminDetail') navItems.admin.classList.add('active'); // Keep admin nav active
    }

    Object.keys(navItems).forEach(key => {
        navItems[key].addEventListener('click', (e) => {
            e.preventDefault();
            if (key === 'notice') { showScreen('notice'); loadNotices(); }
            else if (key === 'admin') { showScreen('adminList'); renderAdminList(); }
            else { showScreen(key); }
        });
    });

    // Simplified navigation
    document.getElementById('start-report-btn').addEventListener('click', () => showScreen('step1'));
    document.getElementById('new-report-btn').addEventListener('click', () => showScreen('home'));

    // --- User-side Logic (Report Submission & Status Check) ---
    document.getElementById('report-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newReport = {
            id: nextReportId++,
            // ... collect data from form ...
            status: 'received'
        };
        reports.unshift(newReport); // Add to beginning
        showScreen('success');
    });

    document.getElementById('check-status-btn').addEventListener('click', () => {
        const phone = document.getElementById('check-phone-number').value;
        renderUserReportList(phone);
    });

    function renderUserReportList(phoneNumber) {
        const userReports = reports.filter(r => r.phoneNumber === phoneNumber);
        const listEl = document.getElementById('report-list');
        listEl.innerHTML = ''; // Clear
        userReports.forEach(report => {
             const li = document.createElement('li');
             const statusInfo = statusMap[report.status];
             li.innerHTML = `<div><strong>${report.company} ${report.deviceId}</strong><span>${report.date}</span></div><span class="${statusInfo.class}">${statusInfo.text}</span>`;
             listEl.appendChild(li);
        });
        document.getElementById('report-list-container').style.display = 'block';
    }

    // --- Admin-side Logic ---
    const adminListContainer = document.getElementById('admin-report-list');

    function renderAdminList() {
        adminListContainer.innerHTML = '<h3>전체 신고 내역</h3><ul></ul>';
        const listEl = adminListContainer.querySelector('ul');
        reports.forEach(report => {
            const li = document.createElement('li');
            li.dataset.reportId = report.id;
            const statusInfo = statusMap[report.status];
            li.innerHTML = `<div><strong>${report.company} ${report.deviceId}</strong><span>${report.date} - ${report.status}</span></div>`;
            li.addEventListener('click', () => showAdminDetail(report.id));
            listEl.appendChild(li);
        });
    }

    function showAdminDetail(reportId) {
        const report = reports.find(r => r.id === reportId);
        if (!report) return;

        document.getElementById('admin-detail-title').textContent = `신고 처리 (ID: ${report.id})`;
        document.getElementById('admin-detail-info').innerHTML = `<p><strong>신고일:</strong> ${report.date}</p><p><strong>기기 ID:</strong> ${report.deviceId}</p>`;
        document.getElementById('admin-user-photo').src = report.userPhoto;
        
        const moveBtn = document.getElementById('mark-as-moved-btn');
        moveBtn.onclick = () => {
            report.status = 'moved';
            alert(`신고 ID ${report.id}의 상태가 '기기이동'으로 변경되었습니다.`);
            showScreen('adminList');
            renderAdminList(); // Refresh list
        };

        showScreen('adminDetail');
    }

    // --- Init ---
    showScreen('home');
});
