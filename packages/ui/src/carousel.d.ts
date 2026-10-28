// File: packages/ui/src/carousel.d.ts
// Types for the looping carousel script (.oc-carousel--loop prev/next buttons).

export function loopTarget(position: number, max: number, step: number, direction: 1 | -1): number;
export function bindCarousel(root: HTMLElement): void;
export function initCarousels(scope?: ParentNode): void;
