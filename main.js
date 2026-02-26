document.addEventListener('DOMContentLoaded', () => {
    // --- Central Data Store ---
    let reports = [
        { id: 1, phoneNumber: '01012345678', deviceType: '킥보드', deviceId: 'S12345', violation: '불법 주차', date: '2024-05-23', userPhoto: 'https://via.placeholder.com/400x300.png?text=User+Photo+1', status: 'received' },
        { id: 2, phoneNumber: '01098765432', deviceType: '자전거', deviceId: 'G67890', violation: '방치', date: '2024-05-22', userPhoto: 'https://via.placeholder.com/400x300.png?text=User+Photo+2', status: 'received' }
    ];
    let nextReportId = 3;
    let currentReportData = {}; // Temp holder for multi-step form

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
    
    // --- Reusable Components ---
    const statusMap = {
        received: { text: '접수', class: 'status-received' },
        moved: { text: '기기이동', class: 'status-moved' },
        completed: { text: '처리완료', class: 'status-completed' },
        rejected: { text: '반려', class: 'status-rejected' }
    };

    // --- Screen & Navigation Logic ---
    function showScreen(screenName) {
        // Hide all screens
        Object.values(screens).forEach(screen => {
            if(screen) screen.style.display = 'none';
        });
        // Show the target screen
        if (screens[screenName]) {
            screens[screenName].style.display = 'block';
        }

        // Update nav active state
        Object.values(navItems).forEach(item => item.classList.remove('active'));
        let activeNav = 'home';
        if (screenName.startsWith('step') || screenName === 'success') activeNav = 'report';
        else if (screenName === 'checkStatus') activeNav = 'check';
        else if (screenName === 'notice') activeNav = 'notice';
        else if (screenName.startsWith('admin')) activeNav = 'admin';

        if (navItems[activeNav]) {
            navItems[activeNav].classList.add('active');
        }
        
        // Set header based on screen
        const header = document.querySelector('header h1');
        const screenTitles = {
            home: '공유 모빌리티 신고', report: '신고하기', check: '신고확인',
            notice: '공지사항', adminList: '관리자 - 신고 목록', adminDetail: '신고 처리'
        };
        header.textContent = screenTitles[activeNav] || '공유 모빌리티 신고';
    }

    // Add nav item event listeners safely
    Object.keys(navItems).forEach(key => {
        if (navItems[key]) {
            navItems[key].addEventListener('click', (e) => {
                e.preventDefault();
                let screenKey = key;
                if(key === 'report') screenKey = 'step1';
                if(key === 'check') screenKey = 'checkStatus';
                if(key === 'admin') screenKey = 'adminList';
                
                showScreen(screenKey);

                if (key === 'notice') loadNotices();
                if (key === 'admin') renderAdminList();
            });
        }
    });

    // --- Page Flow Button Listeners (Safe) ---
    const addClickListener = (id, callback) => {
        const element = document.getElementById(id);
        if (element) element.addEventListener('click', callback);
    };

    addClickListener('start-report-btn', () => showScreen('step1'));
    addClickListener('new-report-btn', () => showScreen('home'));
    addClickListener('next-step-btn', () => {
        currentReportData.deviceType = document.getElementById('device-type').value;
        currentReportData.deviceId = document.getElementById('device-code').value;
        if(!currentReportData.deviceId) { alert('기기 코드를 입력하세요.'); return; }
        showScreen('step2');
    });
    addClickListener('submit-report-btn', () => {
        const phoneNumber = document.getElementById('phone-number').value;
        if(!phoneNumber) { alert('휴대폰 번호를 입력하세요.'); return; }

        const newReport = {
            id: nextReportId++,
            phoneNumber: phoneNumber,
            deviceType: currentReportData.deviceType,
            deviceId: currentReportData.deviceId,
            violation: document.getElementById('violation-type').value,
            date: new Date().toISOString().split('T')[0],
            userPhoto: document.getElementById('image-preview').src,
            status: 'received'
        };
        reports.unshift(newReport);
        showScreen('success');
        // Reset form
        document.getElementById('report-form').reset();
        document.getElementById('device-form').reset();
        currentReportData = {};
    });
    addClickListener('check-status-btn', () => {
        const phone = document.getElementById('check-phone-number').value;
        if(!phone) { alert('휴대폰 번호를 입력하세요.'); return; }
        renderUserReportList(phone);
    });

    // --- User Report Status ---
    function renderUserReportList(phoneNumber) {
        const userReports = reports.filter(r => r.phoneNumber === phoneNumber);
        const listEl = document.getElementById('report-list');
        const container = document.getElementById('report-list-container');
        listEl.innerHTML = '';
        if (userReports.length > 0) {
            userReports.forEach(report => {
                const li = document.createElement('li');
                const statusInfo = statusMap[report.status] || { text: '알 수 없음', class: '' };
                li.innerHTML = `<div class="report-item-info"><strong>${report.deviceId}</strong><span>${report.date}</span></div><span class="report-item-status ${statusInfo.class}">${statusInfo.text}</span>`;
                listEl.appendChild(li);
            });
        } else {
            listEl.innerHTML = '<p>해당 번호로 접수된 신고 내역이 없습니다.</p>';
        }
        container.style.display = 'block';
    }

    // --- Admin Logic ---
    function renderAdminList() {
        const container = document.getElementById('admin-report-list');
        container.innerHTML = '<h3>전체 신고 내역</h3><ul></ul>';
        const listEl = container.querySelector('ul');
        listEl.innerHTML = '';
        reports.forEach(report => {
            const li = document.createElement('li');
            li.dataset.reportId = report.id;
            const statusInfo = statusMap[report.status] || { text: '알 수 없음', class: '' };
            li.innerHTML = `<div class="report-item-info"><strong>${report.deviceId} (${report.deviceType})</strong><span>${report.date}</span></div><span class="report-item-status ${statusInfo.class}">${statusInfo.text}</span>`;
            li.addEventListener('click', () => showAdminDetail(report.id));
            listEl.appendChild(li);
        });
    }

    function showAdminDetail(reportId) {
        const report = reports.find(r => r.id === reportId);
        if (!report) return;

        document.getElementById('admin-detail-title').textContent = `신고 ID: ${report.id}`;
        document.getElementById('admin-detail-info').innerHTML = 
            `<p><strong>신고자:</strong> ${report.phoneNumber}</p>` +
            `<p><strong>기기 ID:</strong> ${report.deviceId}</p>` +
            `<p><strong>위반 유형:</strong> ${report.violation}</p>` +
            `<p><strong>신고일:</strong> ${report.date}</p>`;
        const userPhoto = document.getElementById('admin-user-photo');
        userPhoto.src = report.userPhoto;
        userPhoto.style.display = report.userPhoto ? 'block' : 'none';
        
        const moveBtn = document.getElementById('mark-as-moved-btn');
        moveBtn.onclick = () => {
            report.status = 'moved';
            alert(`신고 ID ${report.id}의 상태가 '기기이동'으로 변경되었습니다.`);
            renderAdminList();
            showScreen('adminList');
        };

        showScreen('adminDetail');
    }

    // --- Placeholder/Utility Functions ---
    function loadNotices() { 
        const noticeList = document.getElementById('notice-list');
        if (noticeList && !noticeList.innerHTML) {
            noticeList.innerHTML = '<p>현재 공지사항이 없습니다.</p>';
        }
    }

    const photoInput = document.getElementById('photo');
    if (photoInput) {
        photoInput.addEventListener('change', () => {
            const file = photoInput.files[0];
            if(file){
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('image-preview').src = e.target.result;
                    document.getElementById('image-preview-container').style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Initial Load ---
    showScreen('home');
});
