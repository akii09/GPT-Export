document.addEventListener("DOMContentLoaded", function (details) {
    const exportToggle = document.getElementById("exportToggle");
    // const exportButton = document.getElementById("exportButton");
    // Load the stored value from local storage when the popup is opened
    chrome.storage.sync.get("exportEnabled", function (data) {
        const exportEnabled = data.exportEnabled === undefined ? true : data.exportEnabled;
        exportToggle.checked = exportEnabled;
        // Update the UI based on the stored switch state
        updateUI(exportEnabled);
    });
    // Update the UI based on the switch state
    function updateUI(exportEnabled) {
        if (exportEnabled) {
            //  if (details.url.includes("chat.openai.com")) {
            //     // Execute content script to add export buttons to ChatGPT responses
            //     injectExportButtons()
            //     // chrome.scripting.executeScript({
            //     //     target: { tabId: details.tabId },
            //     //     function: injectExportButtons
            //     // });
            // }
        } else {
            // exportButton.disabled = true;
            // exportToggle.nextElementSibling.textContent = "Disabled";
        }
    }
    exportToggle.addEventListener("change", function () {
        const exportEnabled = exportToggle.checked;
        chrome.storage.sync.set({ "exportEnabled": exportEnabled });
        // Update the UI based on the switch state
        updateUI(exportEnabled);
    });

    // exportButton.addEventListener("click", function () {
    //     // Code to handle exporting GPT responses goes here
    //     // You can also check the stored exportEnabled value here to decide whether to proceed
    // });
});

// Now we will check first
// Check if the current page matches conditions for ChatGPT responses
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    const currentUrl = currentTab.url;
    chrome.storage.sync.get("exportEnabled", function (data) {
        const exportEnabled = data.exportEnabled === undefined ? true : data.exportEnabled;
        exportToggle.checked = exportEnabled;
        if (exportEnabled) {
            // console.log(currentUrl, 'currentUrl');
            if (currentUrl.includes("chat.openai.com")) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: injectExpormtButtons
                });
                // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                //     console.log(chrome, tabs[0].id, 'chrome 2');
                //     chrome.scripting.executeScript({
                //         target: { tabId: tabs[0].id },
                //         args: ['color'],
                //         func: injectExpormtButtons
                //     });
                // });
            }
        }
    });
});

function injectExpormtButtons() {
    return;
    // Find all elements that might contain ChatGPT responses
    const responseElements = document.querySelectorAll(".markdown");

    // Loop through each element and check if it contains a ChatGPT response
    responseElements.forEach(element => {
        const responseText = element.textContent.trim();

        // You can customize this condition to match your ChatGPT response format
        if (!element.querySelector(".ge-export-buttons")) { //responseText.startsWith("ChatGPT:") && 
            // Create a container div for the buttons
            const buttonContainer = document.createElement("div");
            buttonContainer.className = "ge-export-buttons";
            // Add another class into it
            buttonContainer.classList.add('flex', 'justify-end')
            // Create Export PDF button
            const exportPdfButton = createExportButton("Export PDF", 'pdf');
            buttonContainer.appendChild(exportPdfButton);

            // Create Export Doc button
            const exportDocButton = createExportButton("Export Doc", 'doc');
            buttonContainer.appendChild(exportDocButton);

            // Append the container to the response element
            element.appendChild(buttonContainer);
        }
    });


    function createExportButton(text, type) {
        const button = document.createElement("button");
        button.textContent = text;
        button.classList.add('btn', 'relative', 'btn-neutral', 'whitespace-nowrap', '-z-0', 'border-0', 'md:border', 'mx-3', 'mb-3');
        button.addEventListener("click", function (event) {
            // Code to handle exporting this specific response goes here
            console.log(event,type, 'type of file')
        });

        return button;
    }
}


