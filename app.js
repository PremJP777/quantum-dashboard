// Configuration
const API_BASE_URL = 'http://localhost:5000'; // Your Flask server address
const UPDATE_INTERVAL_MS = 15000; // Update frontend every 15 seconds

// DOM Elements
const backendListElement = document.getElementById('backend-list');
const updateTimeElement = document.getElementById('update-time');

async function fetchDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard-data`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Could not fetch dashboard data:", error);
        // Display an error on the page
        backendListElement.innerHTML = `<div class="error">Could not connect to the server. Is your backend running?</div>`;
        return null;
    }
}

function formatSeconds(seconds) {
    if(seconds === null || seconds === undefined) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function updateBackendList(backends) {
    backendListElement.innerHTML = ''; // Clear current list

    backends.forEach(backend => {
        if (backend.error) {
            // Display an error card for this backend
            const card = document.createElement('div');
            card.className = 'backend-card error';
            card.innerHTML = `<h3>${backend.name}</h3><p>Error: ${backend.error}</p>`;
            backendListElement.appendChild(card);
            return;
        }

        const card = document.createElement('div');
        card.className = `backend-card ${backend.operational ? 'operational' : 'non-operational'}`;

        card.innerHTML = `
            <h3>${backend.name}</h3>
            <p class="status">Status: ${backend.status} (v${backend.version})</p>
            <p class="queue">Pending Jobs: <strong>${backend.pending_jobs}</strong></p>
            <p class="wait">Estimated Wait: <strong>${formatSeconds(backend.estimated_wait_seconds)}</strong></p>
        `;

        // Optional: Add a simple list of qubit errors
        if (backend.qubit_errors && backend.qubit_errors.length > 0) {
            let errorHtml = `<div class="qubit-error-list"><p>Qubit Errors (SX gate):</p><ul>`;
            backend.qubit_errors.slice(0, 5).forEach(qe => { // Show first 5
                errorHtml += `<li>Qubit ${qe.qubit}: ${qe.error ? qe.error.toFixed(5) : 'N/A'}</li>`;
            });
            errorHtml += `</ul></div>`;
            card.innerHTML += errorHtml;
        }

        backendListElement.appendChild(card);
    });
}

// Main function that runs on page load and every interval
async function updateDashboard() {
    console.log("Updating dashboard...");
    const data = await fetchDashboardData();
    if (!data) return;

    updateTimeElement.textContent = new Date(data.updated_at).toLocaleTimeString();
    updateBackendList(data.backends);

    // Here you would also call functions to update your charts!
    // updateQueueChart(data.backends);
}

// Start the periodic update loop
updateDashboard(); // Run immediately on page load
setInterval(updateDashboard, UPDATE_INTERVAL_MS);