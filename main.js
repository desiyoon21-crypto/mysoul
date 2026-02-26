// Get user's location
const locationElement = document.getElementById('location');

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        locationElement.textContent = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;
    }, (error) => {
        locationElement.textContent = 'Could not get location.';
        console.error(error);
    });
}

// Section Elements
const qrScannerSection = document.getElementById('qr-scanner');
const reportFormSection = document.getElementById('report-form');
const successMessageSection = document.getElementById('success-message');

// Form and Buttons
const reportForm = document.querySelector('#report-form form');
const newReportBtn = document.getElementById('new-report-btn');


reportForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const kickboardId = document.getElementById('kickboard-id').textContent;
    const photo = document.getElementById('photo').files[0];

    if (!kickboardId) {
        alert('Please scan a kickboard QR code.');
        return;
    }
    if (!photo) {
        alert('Please select a photo of the violation.');
        return;
    }

    // Hide form and show success message
    reportFormSection.style.display = 'none';
    successMessageSection.style.display = 'block';

    // Here you would typically send the data to a server
});

// QR Code Scanner
let html5QrcodeScanner;

document.addEventListener('DOMContentLoaded', (event) => {
    if (document.getElementById('qr-reader')) {
        html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader", 
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 } 
            }, 
            /* verbose= */ false);
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    }
});

function onScanSuccess(decodedText, decodedResult) {
    console.log(`Scan result: ${decodedText}`, decodedResult);
    document.getElementById('kickboard-id').textContent = decodedText;
    qrScannerSection.style.display = 'none'; // Hide scanner after success
    reportFormSection.style.display = 'block';

    if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.clear().catch(error => {
            console.error("Failed to clear html5QrcodeScanner.", error);
        });
    }
}

function onScanFailure(error) {
  // handle scan failure, usually better to ignore and keep scanning.
}


// Image Preview
const photoInput = document.getElementById('photo');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image-btn');

photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (file) {
        const reader = new FileReader();
        imagePreviewContainer.style.display = 'block';
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
        };
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

// New Report Button
newReportBtn.addEventListener('click', () => {
    // Reset form fields
    document.getElementById('kickboard-id').textContent = '';
    document.getElementById('violation-type').value = 'parking';
    photoInput.value = null;
    imagePreview.src = '#';
    imagePreviewContainer.style.display = 'none';

    // Show the QR scanner and hide other sections
    successMessageSection.style.display = 'none';
    reportFormSection.style.display = 'none';
    qrScannerSection.style.display = 'block';

    // Re-render the QR scanner
    if (html5QrcodeScanner) {
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    }
});
