document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');

    const setDummyCredentials = (tabId) => {
        const activeContent = document.getElementById(tabId);
        if (!activeContent) return;

        const usernameInput = activeContent.querySelector('input[type="text"]');
        const passwordInput = activeContent.querySelector('input[type="password"]');

        switch (tabId) {
            case 'pm-company':
                usernameInput.value = 'pm_user';
                passwordInput.value = 'password';
                break;
            case 'towing-company':
                usernameInput.value = 'towing_user';
                passwordInput.value = 'password';
                break;
            case 'admin':
                usernameInput.value = 'admin_user';
                passwordInput.value = 'password';
                break;
        }
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const tabId = tab.dataset.tab;
            document.getElementById(tabId).classList.add('active');
            
            setDummyCredentials(tabId);
        });
    });

    // Set initial credentials for the default active tab
    const initialTab = document.querySelector('.tab-link.active');
    if (initialTab) {
        setDummyCredentials(initialTab.dataset.tab);
    }

    const handleLogin = (role, username) => {
        const user = {
            username: username || `${role}User`,
            role: role,
            companyId: role === 'pm' ? 101 : null
        };
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'index.html';
    };

    document.getElementById('login-form-pm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.querySelector('input[type="text"]').value;
        handleLogin('pm', username);
    });

    document.getElementById('login-form-towing').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.querySelector('input[type="text"]').value;
        handleLogin('towing', username);
    });

    document.getElementById('login-form-admin').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.querySelector('input[type="text"]').value;
        handleLogin('super', username);
    });
});
