{{-- OmniaUI block: forgot-password - Request a reset link: e-mail field, submit and a back link. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-authpage: Page wrapper that centers one card. Modifier: --plain (page background instead of muted)
       .oc-block-authcard: Card column. Modifiers: --flat (no card chrome), --wide
       .oc-block-authcard-logo: Icon tile above the title
       .oc-block-authcard-head / -title / -text: Centered heading block, title and description
       .oc-block-authcard-fields / -row: Field stack and a justified row (remember me / forgot password)
       .oc-block-authcard-submit: Full-width submit button
       .oc-block-authcard-foot / -legal / -hint: Switch-form line, legal line, small helper text
       .oc-block-authcard-center: Centered column (OTP input)
       .oc-block-authsocial: Auto-fit grid of social buttons
       .oc-block-authduo: Split layout root (container query: two columns from 42rem of its own width). Modifier: --reverse
       .oc-block-authduo-grid / -panel / -form: Grid, brand panel (modifiers --image, --muted, --photo with style="--oc-authduo-photo: url(…)") and form column
       .oc-block-authduo-logo / -quote: Panel logo and quote
       .oc-block-authmin: Minimal centered column without a card
       .oc-separator-text: Divider with centered text (separator component)
     Blade: <x-oc::block.forgot-password> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): title, text, fields, footer, default.
     The default slot replaces the whole content; each named slot replaces one region (a plain string works too).
     Props (0.17.0, optional): form (array of attributes merged onto the <form>, e.g. ['wire:submit' => 'login']; it can override action / method; with it a non-GET form gets @csrf); heading-level (1 default; 2 renders the title as an h2 with the same look).
--}}
@props(['form' => null, 'headingLevel' => 1, 'title' => null, 'text' => null, 'fields' => null, 'footer' => null])
@php
    $ocForm = (new \Illuminate\View\ComponentAttributeBag(is_array($form) ? $form : []))->merge(['class' => 'oc-block-authcard', 'action' => '#', 'method' => 'post']);
    $ocHeading = (int) $headingLevel === 2 ? 'h2' : 'h1';
@endphp
<div {{ $attributes->merge(['class' => 'oc-block-authpage oc-block-authpage--plain']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <form {{ $ocForm }}>
      @if (is_array($form) && strtolower((string) $ocForm->get('method', 'get')) !== 'get') @csrf @endif
    <span class="oc-block-authcard-logo"><svg data-icon="mdi:email-outline" class="" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2zm-2 0l-8 5l-8-5zm0 12H4V8l8 5l8-5z"/></svg></span>
    <div class="oc-block-authcard-head">
      <{{ $ocHeading }} class="oc-block-authcard-title">
          @if (isset($title) && trim((string) $title) !== '')
              {{ $title }}
          @else
          Forgot your password?
          @endif
      </{{ $ocHeading }}>
      <p class="oc-block-authcard-text">
          @if (isset($text) && trim((string) $text) !== '')
              {{ $text }}
          @else
          Enter your e-mail and we will send you a reset link
          @endif
      </p>
    </div>
    <div class="oc-block-authcard-fields">
        @if (isset($fields) && trim((string) $fields) !== '')
            {{ $fields }}
        @else
      <div class="oc-field">
        <label class="oc-field-label" for="oc-forgot-email">E-mail</label>
        <input class="oc-input" id="oc-forgot-email" name="email" type="email" autocomplete="username" required placeholder="name@company1.example">
      </div>
      <button class="oc-btn oc-block-authcard-submit" type="submit">Send reset link</button>
        @endif
    </div>
    <p class="oc-block-authcard-foot">
        @if (isset($footer) && trim((string) $footer) !== '')
            {{ $footer }}
        @else
        <a href="#">Back to sign in</a>
        @endif
    </p>
  </form>
    @endif
</div>
