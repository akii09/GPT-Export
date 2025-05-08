/**
 * Content script for Chrome extension to inject export buttons on ChatGPT pages
 * and export message content in multiple formats (TXT, HTML, PNG, PDF, DOC).
 * Removes all buttons from outputs, preserves CSS styling, and ensures full content in PNG exports.
 * Shows a dropdown UI for format selection on button click.
 * Names exported files based on the current tab title.
 * Runs in a Chrome extension environment, uses pure JavaScript.
 */

// IIFE to avoid polluting global scope
(function () {
  // Constants
  const TARGET_HOST = 'chatgpt.com';
  const MESSAGE_CONTAINER_SELECTOR = '.group\\/turn-messages';
  const EDIT_BUTTON_SELECTOR = 'button[aria-label="Edit in canvas"]';
  const EXPORT_BUTTON_CLASS = 'ce-export-it-button';
  const EXPORT_BUTTON_ID = 'ce-export-it-btn';
  const AGENT_TURN_SELECTOR = '.agent-turn';
  const HANDLED_ATTRIBUTE = 'data-ce-handled';
  const OBSERVER_DEBOUNCE_MS = 100;
  const EXPORT_OPTIONS = [
    { value: 'txt', label: 'Text (TXT)' },
    { value: 'html', label: 'HTML' },
    { value: 'png', label: 'Image (PNG)' },
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'Document (DOC)' }
  ];
  const MAX_CANVAS_WIDTH = 2000;
  const MAX_CANVAS_HEIGHT = 10000;

  // Check if we're on a ChatGPT page
  if (!window.location.hostname.includes(TARGET_HOST)) {
    console.log('Not a ChatGPT page, exiting.');
    return;
  }

  console.log('ChatGPT page detected');

  /**
   * Waits for an element to appear in the DOM
   * @param {Element} container - Parent container to search in
   * @param {string} selector - CSS selector for the target element
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Element|null>} Resolves with the element or null
   */
  function waitForElement(container, selector, timeout = 1000) {
    return new Promise(resolve => {
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

  /**
   * Injects an export button next to the edit button
   * @param {Element} container - Message container element
   */
  async function injectExportButton(container) {
    // Prevent duplicate buttons
    if (container.querySelector(`.${EXPORT_BUTTON_CLASS}`)) return;

    const editBtn = await waitForElement(container, EDIT_BUTTON_SELECTOR);
    if (!editBtn) {
      console.log('Edit button not found in container');
      return;
    }

    const parentSpan = editBtn.closest('span');
    if (!parentSpan || !parentSpan.parentNode) {
      console.log('Parent span not found for edit button');
      return;
    }

    const exportSpan = document.createElement('span');
    exportSpan.className = EXPORT_BUTTON_CLASS;
    exportSpan.setAttribute('data-state', 'closed');
    exportSpan.innerHTML = `
      <button id="${EXPORT_BUTTON_ID}" class="text-token-text-secondary hover:bg-token-main-surface-secondary rounded-lg" aria-label="Export">
        <span class="touch:w-[38px] flex h-[30px] w-[30px] items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md-heavy">
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M13 2C13 1.44772 13.4477 1 14 1H20C20.5523 1 21 1.44772 21 2V8C21 8.55228 20.5523 9 20 9C19.4477 9 19 8.55228 19 8V4.41421L11.7071 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071C9.90237 11.3166 9.90237 10.6834 10.2929 10.2929L17.5858 3H14C13.4477 3 13 2.55228 13 2ZM5 5C3.34315 5 2 6.34315 2 8V19C2 20.6569 3.34315 22 5 22H16C17.6569 22 19 20.6569 19 19V14C19 13.4477 18.5523 13 18 13C17.4477 13 17 13.4477 17 14V19C17 19.5523 16.5523 20 16 20H5C4.44772 20 4 19.5523 4 19V8C4 7.44772 4.44772 7 5 7H10C10.5523 7 11 6.55228 11 6C11 5.44772 10.5523 5 10 5H5Z"
                  fill="currentColor"/>
          </svg>
        </span>
      </button>
    `;

    parentSpan.parentNode.insertBefore(exportSpan, parentSpan.nextSibling);
    console.log('Export button injected');
    attachExportListeners();
  }

  /**
   * Attaches hover listeners to message containers
   */
  function attachHoverListeners() {
    const containers = document.querySelectorAll(MESSAGE_CONTAINER_SELECTOR);
    containers.forEach(container => {
      if (!container.getAttribute(HANDLED_ATTRIBUTE)) {
        container.setAttribute(HANDLED_ATTRIBUTE, 'true');
        container.addEventListener('mouseenter', () => injectExportButton(container), { once: true });
      }
    });
  }

  /**
   * Debounces a function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Sets up MutationObserver to detect new message containers
   */
  function setupObserver() {
    const observer = new MutationObserver(debounce(() => {
      attachHoverListeners();
      attachExportListeners();
    }, OBSERVER_DEBOUNCE_MS));
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Creates and shows the export format dropdown
   * @param {Element} button - Export button
   * @param {Function} onSelect - Callback when a format is selected
   */
  function showExportDropdown(button, onSelect) {
    // Remove any existing dropdown
    const existingDropdown = document.querySelector('.ce-export-dropdown');
    if (existingDropdown) existingDropdown.remove();

    const dropdown = document.createElement('div');
    dropdown.className = 'ce-export-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: ${button.getBoundingClientRect().bottom + window.scrollY + 5}px;
      left: ${button.getBoundingClientRect().left + window.scrollX}px;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      padding: 8px 0;
      z-index: 1000;
      min-width: 120px;
      font-family: Arial, sans-serif;
      font-size: 14px;
    `;

    EXPORT_OPTIONS.forEach(option => {
      const item = document.createElement('div');
      item.style.cssText = `
        padding: 8px 16px;
        cursor: pointer;
        color: #374151;
        transition: background-color 0.2s;
      `;
      item.textContent = option.label;
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#f3f4f6';
      });
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'transparent';
      });
      item.addEventListener('click', () => {
        onSelect(option.value);
        dropdown.remove();
      });
      dropdown.appendChild(item);
    });

    document.body.appendChild(dropdown);

    // Close dropdown on outside click
    const closeDropdown = e => {
      if (!dropdown.contains(e.target) && e.target !== button) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', closeDropdown);
    }, 0);
  }

  /**
   * Attaches click listeners to export buttons
   */
  function attachExportListeners() {
    document.querySelectorAll(`#${EXPORT_BUTTON_ID}`).forEach(button => {
      if (!button.getAttribute('data-listener-attached')) {
        button.setAttribute('data-listener-attached', 'true');
        button.addEventListener('click', () => {
          const exportContainer = button.closest(`.${EXPORT_BUTTON_CLASS}`);
          if (!exportContainer) {
            console.error('Export button container not found');
            return;
          }
          const parentContainer = exportContainer.parentElement;
          if (!parentContainer) {
            console.error('Parent container not found');
            return;
          }
          const agentTurn = parentContainer.closest(AGENT_TURN_SELECTOR);
          if (!agentTurn) {
            console.error('No agent-turn found');
            return;
          }
          showExportDropdown(button, format => {
            exportContent(agentTurn, format);
          });
        });
      }
    });
  }

  /**
   * Sanitizes a string to be a valid file name
   * @param {string} name - Input string
   * @returns {string} Sanitized file name
   */
  function sanitizeFileName(name) {
    if (!name) return 'chatgpt_export';
    // Remove invalid characters, replace spaces with underscores, trim and limit length
    return name
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid chars
      .replace(/\s+/g, '_') // Spaces to underscores
      .replace(/^_+|_+$/g, '') // Trim underscores
      .substring(0, 100) // Limit length
      .trim() || 'chatgpt_export'; // Fallback if empty
  }

  /**
   * Exports content to the specified format
   * @param {Element} element - Element to export
   * @param {string} format - Export format (txt, html, png, pdf, doc)
   */
  function exportContent(element, format) {
    const clonedElement = element.cloneNode(true);
    // Remove all buttons to ensure clean export
    const buttons = clonedElement.querySelectorAll('button');
    buttons.forEach(button => button.remove());
    applyInlineStyles(clonedElement);
    const htmlContent = clonedElement.outerHTML;
    const textContent = clonedElement.textContent.trim();
    const baseFileName = sanitizeFileName(document.title);
    let blob, url;

    try {
      switch (format) {
        case 'txt':
          blob = new Blob([textContent], { type: 'text/plain' });
          url = URL.createObjectURL(blob);
          downloadFile(url, `${baseFileName}.txt`);
          break;

        case 'html':
          blob = new Blob([`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${document.title}</title>
              </head>
              <body>${htmlContent}</body>
            </html>
          `], { type: 'text/html' });
          url = URL.createObjectURL(blob);
          downloadFile(url, `${baseFileName}.html`);
          break;

        case 'png':
          exportToCanvas(clonedElement, canvas => {
            canvas.toBlob(blob => {
              url = URL.createObjectURL(blob);
              downloadFile(url, `${baseFileName}.png`);
              URL.revokeObjectURL(url);
            }, 'image/png');
          });
          break;

        case 'pdf':
          const printWindow = window.open('', '_blank');
          printWindow.document.write(`
            <html>
              <head>
                <title>${document.title}</title>
                <style>
                  @media print {
                    body { margin: 10mm; font-family: Arial, sans-serif; }
                    * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                  }
                </style>
              </head>
              <body>${htmlContent}</body>
            </html>
          `);
          printWindow.document.close();
          printWindow.onload = () => {
            printWindow.print();
            printWindow.onafterprint = () => printWindow.close();
          };
          break;

        case 'doc':
          blob = new Blob([`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${document.title}</title>
              </head>
              <body>${htmlContent}</body>
            </html>
          `], { type: 'application/msword' });
          url = URL.createObjectURL(blob);
          downloadFile(url, `${baseFileName}.doc`);
          break;

        default:
          alert('Unsupported format.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('An error occurred during export.');
    } finally {
      if (url) URL.revokeObjectURL(url);
    }
  }

  /**
   * Applies inline styles to preserve CSS
   * @param {Element} element - Element to style
   */
  function applyInlineStyles(element) {
    const elements = [element, ...element.querySelectorAll('*')];
    const importantStyles = [
      'background-color', 'color', 'font-family', 'font-size', 'font-weight',
      'padding', 'margin', 'border', 'text-align', 'line-height'
    ];
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      let inlineStyle = '';
      importantStyles.forEach(prop => {
        const value = style.getPropertyValue(prop);
        if (value && value !== 'none' && value !== 'normal') {
          inlineStyle += `${prop}: ${value}; `;
        }
      });
      if (inlineStyle) {
        el.style.cssText = inlineStyle;
      }
    });
  }

  /**
   * Downloads a file
   * @param {string} url - Blob URL
   * @param {string} fileName - File name
   */
  function downloadFile(url, fileName) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Renders element to canvas, ensuring full content is captured
   * @param {Element} element - Element to render
   * @param {Function} callback - Callback with canvas
   */
  function exportToCanvas(element, callback) {
    // Clone element and append off-screen to measure full size
    const clone = element.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.width = 'auto';
    clone.style.maxWidth = `${MAX_CANVAS_WIDTH}px`;
    clone.style.display = 'block';
    document.body.appendChild(clone);

    // Calculate full size
    const rect = clone.getBoundingClientRect();
    const scrollWidth = clone.scrollWidth;
    const scrollHeight = clone.scrollHeight;
    const computedStyle = window.getComputedStyle(clone);
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;

    // Set canvas size
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = Math.min(Math.max(scrollWidth, rect.width) + paddingLeft + paddingRight, MAX_CANVAS_WIDTH);
    canvas.height = Math.min(Math.max(scrollHeight, rect.height) + paddingTop + paddingBottom, MAX_CANVAS_HEIGHT);

    // Apply background
    ctx.fillStyle = computedStyle.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render content
    let yOffset = paddingTop;
    const renderNode = (node, x = paddingLeft, depth = 0) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) {
          const parentStyle = window.getComputedStyle(node.parentElement);
          ctx.font = `${parentStyle.fontWeight} ${parentStyle.fontSize} ${parentStyle.fontFamily || 'Arial'}`;
          ctx.fillStyle = parentStyle.color || '#000000';
          ctx.textAlign = parentStyle.textAlign || 'left';

          const lineHeight = parseFloat(parentStyle.lineHeight) || 20;
          const maxWidth = canvas.width - x - paddingRight;
          const words = text.split(' ');
          let line = '';
          let lines = [];

          // Word wrap
          for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line) {
              lines.push(line);
              line = word;
            } else {
              line = testLine;
            }
          }
          if (line) lines.push(line);

          lines.forEach(line => {
            ctx.fillText(line, x, yOffset + lineHeight * 0.8);
            yOffset += lineHeight;
          });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(node);
        const marginTop = parseFloat(style.marginTop) || 0;
        const marginBottom = parseFloat(style.marginBottom) || 0;
        yOffset += marginTop;

        // Recurse through child nodes
        Array.from(node.childNodes).forEach(child => {
          renderNode(child, x, depth + 1);
        });

        yOffset += marginBottom;
      }
    };

    // Render all nodes
    Array.from(clone.childNodes).forEach(node => renderNode(node));

    // Clean up
    document.body.removeChild(clone);

    callback(canvas);
  }

  /**
   * Initializes the extension
   */
  function init() {
    attachHoverListeners();
    attachExportListeners();
    setupObserver();
  }

  init();
})();