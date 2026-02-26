document.addEventListener('DOMContentLoaded', () => {
    // Step DOM Elements
    const step1 = document.getElementById('step1-device-info');
    const step2 = document.getElementById('step2-detailed-report');
    const successMessage = document.getElementById('success-message');

    // Button Elements
    const nextStepBtn = document.getElementById('next-step-btn');
    const reportForm = document.getElementById('report-form');
    const newReportBtn = document.getElementById('new-report-btn');

    // Input Elements
    const deviceCodeInput = document.getElementById('device-code');
    const photoInput = document.getElementById('photo');
    const phoneNumberInput = document.getElementById('phone-number');

    // Map & Location Elements
    const locationText = document.getElementById('location-text');
    let map, marker;

    // --- Step 1 to Step 2 Transition ---
    nextStepBtn.addEventListener('click', () => {
        if (!deviceCodeInput.value) {
            alert('기기 코드를 입력해주세요.');
            return;
        }
        step1.style.display = 'none';
        step2.style.display = 'block';
        initializeMap();
    });

    // --- Map Initialization and Geolocation ---
    function initializeMap() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                locationText.textContent = `위도: ${latitude.toFixed(5)}, 경도: ${longitude.toFixed(5)}`;
                
                if (!map) { // Initialize map only once
                    map = L.map('map').setView([latitude, longitude], 16);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(map);
                    marker = L.marker([latitude, longitude]).addTo(map);
                }

            }, (error) => {
                locationText.textContent = '위치를 가져올 수 없습니다. 브라우저의 위치 정보 접근을 허용해주세요.';
                console.error('Geolocation Error:', error);
                // Default map view if location fails
                if (!map) {
                    map = L.map('map').setView([37.5665, 126.9780], 13); // Default to Seoul
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                }
            });
        } else {
            locationText.textContent = '이 브라우저에서는 위치 정보를 지원하지 않습니다.';
        }
    }

    // --- Image Preview ---
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');

    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (file) {
            const reader = new FileReader();
            imagePreviewContainer.style.display = 'block';
            reader.onload = (e) => { imagePreview.src = e.target.result; };
            reader.readAsDataURL(file);
        } else {
            imagePreviewContainer.style.display = 'none';
        }
    });

    removeImageBtn.addEventListener('click', () => {
        photoInput.value = null;
        imagePreview.src = '#';
        imagePreviewContainer.style.display = 'none';
    });

    // --- Final Form Submission ---
    reportForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!photoInput.files[0]) {
            alert('사진을 첨부해주세요.');
            return;
        }
        if (!phoneNumberInput.value) {
            alert('휴대폰 번호를 입력해주세요.');
            return;
        }

        // Here you would typically gather all data and send to a server
        console.log('Report Submitted:', {
            deviceType: document.getElementById('device-type').value,
            deviceCode: deviceCodeInput.value,
            location: locationText.textContent,
            violationType: document.getElementById('violation-type').value,
            phoneNumber: phoneNumberInput.value,
            photo: photoInput.files[0].name
        });

        step2.style.display = 'none';
        successMessage.style.display = 'block';
    });

    // --- New Report Button ---
    newReportBtn.addEventListener('click', () => {
        // Reset all forms and inputs
        deviceCodeInput.value = '';
        photoInput.value = null;
        phoneNumberInput.value = '';
        imagePreview.src = '#';
        imagePreviewContainer.style.display = 'none';
        document.getElementById('device-type').value = 'kickboard';
        document.getElementById('violation-type').value = 'parking';
        locationText.textContent = '현재 위치를 불러오는 중...';
        
        // Reset view to step 1
        successMessage.style.display = 'none';
        step2.style.display = 'none';
        step1.style.display = 'block';
    });
});
