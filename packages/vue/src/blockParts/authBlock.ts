// File: packages/vue/src/blockParts/authBlock.ts | Map: shared prop types of the auth page blocks (login, signup, otp, forgot / reset password)
// Lives outside src/blocks so the index generator does not list it.

export type AuthBlockLayout = 'card' | 'split' | 'minimal'

export interface AuthLink {
  label: string
  href: string
}

export interface AuthBlockPanel {
  /** .oc-block-authduo-panel--image (default), --muted or --photo (with `photo`). */
  tone?: 'image' | 'muted' | 'photo'
  /** Photo url for tone "photo" (--oc-authduo-photo). */
  photo?: string
  /** Brand name next to the logo icon (default "Company 1"); the `panel-logo` slot replaces icon + name. */
  logo?: string
  logoHref?: string
  quote?: string
  quoteAuthor?: string
}

export interface AuthBlockBaseProps {
  /** card: centered card (.oc-block-authpage); split: brand panel + form (.oc-block-authduo); minimal: no card (.oc-block-authmin). */
  layout?: AuthBlockLayout
  /** Card layout: muted page (drops --plain). */
  muted?: boolean
  /** Split layout: panel on the other side (--reverse). */
  reverse?: boolean
  panel?: AuthBlockPanel
  /** Icon tile above the title (webicon name); null hides it. Split layouts have none by default. */
  icon?: string | null
  title?: string
  /** 0.17.0: heading level of the title (default 1; 2 when the form sits lower on a page). */
  headingLevel?: 1 | 2
  text?: string
  /** Social button labels; empty hides them with the divider. Emits `social` (index). */
  social?: string[]
  socialPosition?: 'top' | 'bottom'
  dividerLabel?: string
  submitLabel?: string
  /** Helper text above the submit button. */
  hint?: string
  /** Switch-form line text, followed by `footerLink`. The `footer` slot replaces both. */
  footer?: string
  footerLink?: AuthLink | null
  /** Legal line text, followed by `legalLinks` ("A and B."). The `legal` slot replaces both. */
  legal?: string
  legalLinks?: AuthLink[]
  action?: string
  method?: string
  wide?: boolean
}

export interface AuthLoginProps extends AuthBlockBaseProps {
  emailLabel?: string
  emailPlaceholder?: string
  passwordLabel?: string
  /** false: magic-link form without a password field. */
  password?: boolean
  /** Remember-me label; null hides it. */
  rememberLabel?: string | null
  /** Forgot-password link; null hides it. */
  forgot?: AuthLink | null
}

export interface AuthSignupProps extends AuthBlockBaseProps {
  /** Full-name label; null hides the field. */
  nameLabel?: string | null
  namePlaceholder?: string
  emailLabel?: string
  emailPlaceholder?: string
  passwordLabel?: string
  /** Confirm-password label; null hides the field. */
  confirmLabel?: string | null
  /** Terms checkbox text, followed by `termsLink`; null hides the checkbox. */
  terms?: string | null
  termsLink?: AuthLink | null
}

export interface AuthOtpProps extends AuthBlockBaseProps {
  codeLabel?: string
  /** Help text under the code. */
  description?: string
  /** Code length (default 6). */
  length?: number
}

export interface AuthForgotProps extends AuthBlockBaseProps {
  emailLabel?: string
  emailPlaceholder?: string
}

export interface AuthResetProps extends AuthBlockBaseProps {
  passwordLabel?: string
  /** Confirm-password label; null hides the field. */
  confirmLabel?: string | null
}

export type AuthBlockKind = 'login' | 'signup' | 'otp' | 'forgot' | 'reset'

/** Default icon tile per form. */
export const AUTH_ICONS: Record<AuthBlockKind, string> = {
  login: 'mdi:layers-outline',
  signup: 'mdi:layers-outline',
  otp: 'mdi:shield-outline',
  forgot: 'mdi:email-outline',
  reset: 'mdi:lock-outline',
}

/** @internal Props of the shared renderer: every form field prop plus the form kind. */
export interface AuthBlockAllProps extends AuthLoginProps, AuthSignupProps, AuthOtpProps, AuthForgotProps, AuthResetProps {
  kind: AuthBlockKind
}
