// Function to inject export buttons
function injectExportBtn() {
    const responseElements = document.querySelectorAll(".markdown");

    responseElements.forEach(element => {
        if (!element.querySelector(".ge-export-buttons")) {
            const buttonContainer = document.createElement("div");
            buttonContainer.className = "ge-export-buttons flex justify-end";
            
            const exportPdfButton = createExportButton("Export PDF", 'pdf');
            const exportDocButton = createExportButton("Export Doc", 'doc');
            
            buttonContainer.appendChild(exportPdfButton);
            buttonContainer.appendChild(exportDocButton);
            
            element.appendChild(buttonContainer);
        }
    });

    function createExportButton(text, type) {
        const button = document.createElement("button");
        button.textContent = text;
        button.className = 'btn relative btn-neutral whitespace-nowrap -z-0 border-0 md:border mx-3 mb-3';
        
        button.addEventListener("click", event => {
            console.log(event, type, 'type of file');
            // Code to handle exporting this specific response goes here
        });

        return button;
    }
}

// Set up a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            if (window.location.href.includes("chat.openai.com")) {
                injectExportBtn();
            }
        }
    }
});

// Start observing changes in the entire document
observer.observe(document, { childList: true, subtree: true });

// Request the exportEnabled value from the background script
chrome.runtime.sendMessage({ action: "getExportEnabled" }, response => {
    const exportEnabled = response.exportEnabled === undefined ? true : response.exportEnabled;
    
    if (window.location.href.includes("chat.openai.com") && exportEnabled) {
        injectExportBtn();
    }
});
