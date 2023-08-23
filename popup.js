document.addEventListener("DOMContentLoaded", function () {
    const exportToggle = document.getElementById("exportToggle");
    // const exportButton = document.getElementById("exportButton");
    // Load the stored value from local storage when the popup is opened
    chrome.storage.local.get("exportEnabled", function (data) {
        const exportEnabled = data.exportEnabled === undefined ? true : data.exportEnabled;
        exportToggle.checked = exportEnabled;
        // Update the UI based on the stored switch state
        updateUI(exportEnabled);
    });
    // Update the UI based on the switch state
    function updateUI(exportEnabled) {
        if (exportEnabled) {
            // exportButton.disabled = false;
            // exportToggle.nextElementSibling.textContent = "Enabled";
        } else {
            // exportButton.disabled = true;
            // exportToggle.nextElementSibling.textContent = "Disabled";
        }
    }
    exportToggle.addEventListener("change", function () {
        const exportEnabled = exportToggle.checked;
        chrome.storage.local.set({ "exportEnabled": exportEnabled });
        // Update the UI based on the switch state
        updateUI(exportEnabled);
    });

    // exportButton.addEventListener("click", function () {
    //     // Code to handle exporting GPT responses goes here
    //     // You can also check the stored exportEnabled value here to decide whether to proceed
    // });
});
