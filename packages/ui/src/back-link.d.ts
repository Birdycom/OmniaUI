// File: packages/ui/src/back-link.d.ts
// Types for the back link script.

export function canGoBack(win?: Window): boolean;
export function bindBackLink(link: HTMLAnchorElement): void;
export function initBackLinks(scope?: ParentNode): void;
