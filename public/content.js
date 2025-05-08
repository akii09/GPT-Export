(function () {
  const url = window.location.hostname;
  if (!url.includes("chatgpt.com")) return;

  console.log("ChatGPT page detected");

  function waitForElement(container, selector, timeout = 1000) {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const check = () => {
        const el = container.querySelector(selector);
        if (el) return resolve(el);
        if (Date.now() - startTime > timeout) return resolve(null);
        requestAnimationFrame(check);
      };

      check();
    });
  }

  async function handleHover(container) {
    // Prevent duplication
    if (container.querySelector(".ce-export-it-button")) return;

    // Wait for the target "Edit in canvas" button to appear
    const editBtn = await waitForElement(
      container,
      'button[aria-label="Edit in canvas"]'
    );
    if (!editBtn) return;

    const parentSpan = editBtn.closest("span");
    if (!parentSpan || !parentSpan.parentNode) return;

    // Create and insert export button
    const exportSpan = document.createElement("span");
    exportSpan.className = "ce-export-it-button";
    exportSpan.setAttribute("data-state", "closed");
    exportSpan.innerHTML = `
        <button id="ce-export-it-btn" class="text-token-text-secondary hover:bg-token-main-surface-secondary rounded-lg" aria-label="Export">
          <span class="touch:w-[38px] flex h-[30px] w-[30px] items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
              <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M13 2C13 1.44772 13.4477 1 14 1H20C20.5523 1 21 1.44772 21 2V8C21 8.55228 20.5523 9 20 9C19.4477 9 19 8.55228 19 8V4.41421L11.7071 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071C9.90237 11.3166 9.90237 10.6834 10.2929 10.2929L17.5858 3H14C13.4477 3 13 2.55228 13 2ZM5 5C3.34315 5 2 6.34315 2 8V19C2 20.6569 3.34315 22 5 22H16C17.6569 22 19 20.6569 19 19V14C19 13.4477 18.5523 13 18 13C17.4477 13 17 13.4477 17 14V19C17 19.5523 16.5523 20 16 20H5C4.44772 20 4 19.5523 4 19V8C4 7.44772 4.44772 7 5 7H10C10.5523 7 11 6.55228 11 6C11 5.44772 10.5523 5 10 5H5Z"
                      fill="currentColor"/>
            </svg>
          </span>
        </button>
      `;

    parentSpan.parentNode.insertBefore(exportSpan, parentSpan.nextSibling);

    exportSpan.querySelectorAll("#ce-export-it-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const buttonContainer = button.closest("#ce-export-it-btn");
        console.log(buttonContainer, "buttonContainer");
        const parentContainer = buttonContainer.parentElement;
        console.log(parentContainer, "parentContainer");
        let previousElement = parentContainer.previousElementSibling;
        const agentTurn = previousElement.closest(".agent-turn");
        if (!agentTurn) {
          console.log("No agent turn found");
          return;
        }
        console.log(agentTurn, "agentTurn");
      });
    });

    console.log("Export button injected on first hover.");
  }

  function attachListeners() {
    const messageContainers = document.querySelectorAll(
      ".group\\/turn-messages"
    );
    messageContainers.forEach((container) => {
      if (!container.dataset.ceHandled) {
        container.dataset.ceHandled = "true";
        container.addEventListener("mouseenter", () => handleHover(container));
      }
    });
  }

  const observer = new MutationObserver(() => {
    attachListeners();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  attachListeners();
})();
