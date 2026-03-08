export const EXTRACT_PAGE_TEXT = `EXTRACT_PAGE_TEXT` as const;

export type ExtractPageTextAction = {
  action: typeof EXTRACT_PAGE_TEXT;
};

export type ExtractPageTextRequest = ExtractPageTextAction & {
  tabId: number;
};

export type ExtractPageTextResponse = {
  text: string;
  url: string;
  error?: string;
};
