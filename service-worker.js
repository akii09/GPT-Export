// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getExportEnabled") {
        console.log('req received from content file')
        // Get the exportEnabled value from storage and send it back
        chrome.storage.sync.get('exportEnabled', data => {
            sendResponse({ exportEnabled: data.exportEnabled });
        });
    }
    return true; // Indicates that the response will be sent asynchronously
});


// // Listen for messages from the popup script
// chrome.runtime.onInstalled.addListener(() => {
//     chrome.storage.sync.set({ exportEnabled: true }, () => {
//     });
// });
// // Get data from storage
// chrome.storage.sync.get('exportEnabled', (data) => {
//     console.log(data.exportEnabled, 'isEnabled');
//     // Call function
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         console.log(chrome, tabs[0].id, 'chrome tab is enabled or not');
//         const currentTab = tabs[0];
//         const currentUrl = currentTab.url;
//         console.log(currentUrl, 'currentUrl from service worker');
//         if (currentUrl.includes("chat.openai.com")) {
//             chrome.scripting.executeScript({
//                 target: { tabId: tabs[0].id },
//                 func: injectExportBtn
//             });
//         }
//     });
// });

// function injectExportBtn() {
//     console.log('Function called done')
//     // Find all elements that might contain ChatGPT responses
//     const responseElements = document.querySelectorAll(".markdown");

//     // Loop through each element and check if it contains a ChatGPT response
//     responseElements.forEach(element => {
//         const responseText = element.textContent.trim();

//         // You can customize this condition to match your ChatGPT response format
//         if (!element.querySelector(".ge-export-buttons")) { //responseText.startsWith("ChatGPT:") && 
//             // Create a container div for the buttons
//             const buttonContainer = document.createElement("div");
//             buttonContainer.className = "ge-export-buttons";
//             // Add another class into it
//             buttonContainer.classList.add('flex', 'justify-end')
//             // Create Export PDF button
//             const exportPdfButton = createExportButton("Export PDF", 'pdf');
//             buttonContainer.appendChild(exportPdfButton);

//             // Create Export Doc button
//             const exportDocButton = createExportButton("Export Doc", 'doc');
//             buttonContainer.appendChild(exportDocButton);

//             // Append the container to the response element
//             element.appendChild(buttonContainer);
//         }
//     });


//     function createExportButton(text, type) {
//         const button = document.createElement("button");
//         button.textContent = text;
//         button.classList.add('btn', 'relative', 'btn-neutral', 'whitespace-nowrap', '-z-0', 'border-0', 'md:border', 'mx-3', 'mb-3');
//         button.addEventListener("click", function (event) {
//             // Code to handle exporting this specific response goes here
//             console.log(event,type, 'type of file')
//         });

//         return button;
//     }
// }