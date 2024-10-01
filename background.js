// Array to store intercepted URLs
let interceptedUrls = [];

// Folder paths for different file types
const folderMap = {
    'image': 'Images',
    'video': 'Videos',
    'audio': 'Music',
    'application/pdf': 'Documents'
};

function getFolderForMimeType(mimeType) {
    for (let type in folderMap) {
        if (mimeType.startsWith(type)) {
            return folderMap[type];
        }
    }
    return null;
}

// Intercept requests to handle downloads based on user settings
browser.webRequest.onBeforeRequest.addListener(
    async (details) => {
        // Get user settings
        const data = await browser.storage.local.get(['massDownloadEnabled', 'downloadAndLoad', 'interceptEnabled']);
        
        //console.log('Mass Download Enabled:', data.massDownloadEnabled); // Debug output
        //console.log('Intercept Enabled:', data.interceptEnabled); // Debug output

        // Check if URL interception is enabled
        if (!data.interceptEnabled) return;

        const mimeType = details.type;
        const folder = getFolderForMimeType(mimeType);

        if (folder) {
            const url = details.url.split('/').pop();
            const filename = `${folder}/${url}`;

            // Add the intercepted URL to the array
            interceptedUrls.push({ url: details.url, filename: filename });
            //console.log('Intercepted URL:', { url: details.url, filename: filename }); // Debug output

            // Check if mass downloads are enabled
            if (data.massDownloadEnabled) {
                // Trigger download
                browser.downloads.download({
                    url: details.url,
                    filename: filename,
                    conflictAction: 'uniquify'
                });

                // If 'download and load' is disabled, cancel loading on the page
                if (!data.downloadAndLoad) {
                    return { cancel: true };
                }
            }
        }
    },
    { urls: ['<all_urls>'] },
    ['blocking']
);

// Function to download intercepted URLs
async function downloadInterceptedData() {
    const blob = new Blob([JSON.stringify(interceptedUrls, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'intercepted_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Expose the download function to the popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'downloadInterceptedData') {
        downloadInterceptedData();
        sendResponse({ status: 'success' });
    }
});

// Listen for messages from the popup
browser.runtime.onMessage.addListener((message) => {
    if (message.action === "clearInterceptedUrls") {
        interceptedUrls = []; // Clear the array
        console.log("Intercepted URLs cleared:", interceptedUrls);
    }
});
