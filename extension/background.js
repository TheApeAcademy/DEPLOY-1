// ApeAcademy Extension — background.js (Manifest V3 service worker)

// Create context menu item on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'submit-to-apeacademy',
    title: 'Submit to ApeAcademy',
    contexts: ['selection'],
  });
});

// On context menu click: store selected text and open popup
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'submit-to-apeacademy' && info.selectionText) {
    // Store the selected text so popup.js can pick it up on open
    chrome.storage.local.set({ ape_context_selection: info.selectionText }, () => {
      // Open the extension popup by opening a small window pointing to popup.html
      chrome.windows.create({
        url: chrome.runtime.getURL('popup.html'),
        type: 'popup',
        width: 400,
        height: 540,
        focused: true,
      });
    });
  }
});
