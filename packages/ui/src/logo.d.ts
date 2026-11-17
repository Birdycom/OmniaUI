// File: packages/ui/src/logo.d.ts
// Types for the logo plate measuring (.oc-logo[data-plate="auto"]).

export type LogoPlate = "light" | "dark" | "both" | "none";
/** Relative luminance (WCAG) of an sRGB color, channels 0 to 255. */
export function luminance(r: number, g: number, b: number): number;
/** Which theme needs a plate, from RGBA pixel data. */
export function plateFromPixels(data: ArrayLike<number>): LogoPlate;
/** Measures an image URL once (cached). Another origin without CORS resolves "none". */
export function measureLogo(src: string): Promise<LogoPlate>;
/** Measures one .oc-logo[data-plate="auto"] and writes data-plate. */
export function bindLogo(root: HTMLElement): Promise<void>;
/** Measures every .oc-logo[data-plate="auto"] in scope. */
export function initLogos(scope?: ParentNode): Promise<void[]>;
