// Configuration - replace with your actual backend URL
const API_URL = 'https://your-backend-api-endpoint.com/run-script';

// DOM Elements
const packageIdInput = document.getElementById('packageId');
const checkButton = document.getElementById('checkButton');
const logsContainer = document.getElementById('logs');

// Event Listeners
checkButton.addEventListener('click', runScript);
packageIdInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        runScript();
    }
});

async function runScript() {
    const packageId = packageIdInput.value.trim();

    // Input Validation
    if (!packageId) {
        displayLog('Please enter a Package Asset ID', 'error');
        return;
    }

    // Disable button and clear previous logs
    checkButton.disabled = true;
    logsContainer.innerHTML = '';
    displayLog('Processing... Please wait', 'info');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ packageId: packageId })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Clear previous loading message
        logsContainer.innerHTML = '';

        // Process and display logs
        data.logs.forEach(log => {
            let logType = 'info';
            if (log.includes('[ERROR]')) {
                logType = 'error';
            } else if (log.includes('[WARNING]')) {
                logType = 'warning';
            }
            displayLog(log, logType);
        });

    } catch (error) {
        displayLog(`Error: ${error.message}`, 'error');
    } finally {
        // Re-enable button
        checkButton.disabled = false;
    }
}

function displayLog(message, type = 'info') {
    const logEntry = document.createElement('div');
    logEntry.classList.add(`log-${type}`);
    logEntry.textContent = message;
    logsContainer.appendChild(logEntry);
    
    // Auto-scroll to bottom
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Optional: Add error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    displayLog(`Unhandled error: ${event.reason}`, 'error');
});
