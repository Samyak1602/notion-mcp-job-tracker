import { EXTRACT_PAGE_TEXT } from '../constants';
import type { ExtractPageTextRequest, ExtractPageTextResponse } from '../constants';

function extractPageText(): ExtractPageTextResponse {
  return {
    text: document.body.innerText ?? ``,
    url: window.location.href ?? ``,
  };
}

chrome.runtime.onInstalled.addListener(() => {
  console.log(`Extension installed`);
});

chrome.runtime.onMessage.addListener(
  (
    message: ExtractPageTextRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtractPageTextResponse) => void
  ) => {
    if (message.action === EXTRACT_PAGE_TEXT && message.tabId) {
      chrome.scripting
        .executeScript({
          target: { tabId: message.tabId },
          func: extractPageText,
        })
        .then(([result]) => {
          const response = result?.result as ExtractPageTextResponse | undefined;
          sendResponse(response ?? { text: ``, url: `` });
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : `Unknown error`;
          sendResponse({ text: ``, url: ``, error: message });
        });
      return true; // Keep channel open for async sendResponse
    }
  }
);
