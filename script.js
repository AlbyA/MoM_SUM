// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const fileInfo = document.getElementById('fileInfo');
const formActions = document.getElementById('formActions');
const uploadForm = document.getElementById('uploadForm');
const startBtn = document.getElementById('startBtn');
const successMessage = document.getElementById('successMessage');
const googleSheetLink = document.getElementById('googleSheetLink');
const loadingOverlay = document.getElementById('loadingOverlay');

// Webhook URL - Replace with your actual webhook URL
const WEBHOOK_URL = 'https://toobasparkai.app.n8n.cloud/webhook/upload-MoM';

// Google Sheet URL - Replace with your actual Google Sheet link
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/16mk_BClUz66hbcb0IR7xU93jXic9A8AWdSa618hNf0c/edit?usp=drive_link';

// File handling
let selectedFile = null;

// Drag and drop handlers
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelection(files[0]);
    }
});

// Click to browse
browseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.click();
});

uploadArea.addEventListener('click', (e) => {
    // Only trigger file input if clicking on the upload area itself, not on buttons
    if (e.target === uploadArea || e.target.closest('.upload-content')) {
        fileInput.click();
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
    }
});

// Handle file selection
function handleFileSelection(file) {
    // Validate file type
    if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file only.');
        fileInput.value = '';
        return;
    }

    // Validate file size (optional - adjust as needed)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        alert('File size exceeds 10MB. Please upload a smaller file.');
        fileInput.value = '';
        return;
    }

    selectedFile = file;
    
    // Display file info
    fileInfo.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
    fileInfo.style.display = 'inline-block';
    
    // Show Start button
    formActions.style.display = 'block';
    
    // Update upload area appearance
    uploadArea.style.borderColor = 'var(--success-color)';
    uploadArea.style.background = '#ecfdf5';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Form submission
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
        alert('Please select a PDF file first.');
        return;
    }

    // Show loading overlay
    loadingOverlay.style.display = 'flex';
    startBtn.disabled = true;
    
    try {
        // Log file information
        console.log('Uploading file:', {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            lastModified: new Date(selectedFile.lastModified).toISOString()
        });
        console.log('Sending to webhook:', WEBHOOK_URL);
        
        // Prepare form data
        const formData = new FormData();
        formData.append('MoM', selectedFile);
        
        // Trigger webhook
        // Option 1: Send file directly (if webhook supports multipart/form-data)
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });
        
        console.log('Webhook response status:', response.status);
        
        // Option 2: If webhook expects JSON, you can send file info instead
        // const response = await fetch(WEBHOOK_URL, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         fileName: selectedFile.name,
        //         fileSize: selectedFile.size,
        //         fileType: selectedFile.type
        //     })
        // });
        
        if (!response.ok) {
            throw new Error(`Webhook request failed: ${response.statusText}`);
        }
        
        // Wait for webhook processing (optional - adjust timing as needed)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Hide form and loading, show success
        uploadForm.style.display = 'none';
        loadingOverlay.style.display = 'none';
        
        // Set Google Sheet link using the configured URL
        googleSheetLink.href = GOOGLE_SHEET_URL;
        googleSheetLink.textContent = 'View Google Sheet';
        googleSheetLink.style.display = 'inline-block';
        
        successMessage.style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        loadingOverlay.style.display = 'none';
        startBtn.disabled = false;
        alert('An error occurred while processing your file. Please try again.');
    }
});

// Reset functionality (optional - add a reset button if needed)
function resetForm() {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.textContent = '';
    fileInfo.style.display = 'none';
    formActions.style.display = 'none';
    uploadArea.style.borderColor = 'var(--border-color)';
    uploadArea.style.background = 'var(--background)';
    uploadForm.style.display = 'block';
    successMessage.style.display = 'none';
}

