// Background service worker for Chrome Extension (Manifest V3)
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});
