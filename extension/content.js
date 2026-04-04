// ApeAcademy Extension — content.js
// Runs on every page. Listens for messages from popup.js.

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    const selected = window.getSelection()?.toString()?.trim() || '';
    sendResponse({ text: selected });
    return true; // keep channel open for async
  }
});
