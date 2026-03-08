import { EXTRACT_PAGE_TEXT } from '../constants';
import type { ExtractPageTextAction, ExtractPageTextResponse } from '../constants';

chrome.runtime.onMessage.addListener(
  (
    message: ExtractPageTextAction,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtractPageTextResponse) => void
  ) => {
    if (message.action === EXTRACT_PAGE_TEXT) {
      const text = document.body.innerText ?? ``;
      const url = window.location.href ?? ``;
      sendResponse({ text, url });
    }
    return true; // Keep message channel open for async sendResponse
  }
);
