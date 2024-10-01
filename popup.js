// Get the toggle elements
const downloadToggle = document.getElementById("downloadToggle");
const loadToggle = document.getElementById("loadToggle");

// Load the current settings from storage
browser.storage.local.get(['massDownloadEnabled', 'downloadAndLoad', 'interceptEnabled']).then((data) => {
    downloadToggle.checked = data.massDownloadEnabled || false;
    loadToggle.checked = data.downloadAndLoad || false;
    document.getElementById('interceptToggle').checked = data.interceptEnabled || false;
});

document.getElementById('interceptToggle').addEventListener('change', (event) => {
    browser.storage.local.set({ interceptEnabled: event.target.checked });
});

// Listen for mass download toggle change
downloadToggle.addEventListener("change", (event) => {
    const isEnabled = event.target.checked;
    browser.storage.local.set({ massDownloadEnabled: isEnabled });
});

// Listen for download and load toggle change
loadToggle.addEventListener("change", (event) => {
    const isLoadEnabled = event.target.checked;
    browser.storage.local.set({ downloadAndLoad: isLoadEnabled });
});

document.getElementById('downloadData').addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'downloadInterceptedData' })
        .then(response => {
            if (response.status === 'success') {
                console.log('Download initiated successfully.');
            }
        })
        .catch(error => {
            console.error('Error initiating download:', error);
        });
});

// Add event listener for the clear button
document.getElementById('clearButton').addEventListener('click', () => {
    // Send a message to the background script to clear the intercepted URLs
    browser.runtime.sendMessage({ action: "clearInterceptedUrls" })
        .then(() => {
            alert("Intercepted URLs have been cleared.");
        });
});