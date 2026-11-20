{{-- OmniaUI block: otp-02 - Verification form beside a brand panel (container-query split). Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
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
       .oc-otp: Code input drawn as cells (component); set --oc-otp-length and maxlength
     Blade: <x-oc::block.otp-02> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): panel, title, text, fields, footer, default.
     The default slot replaces the whole content; each named slot replaces one region (a plain string works too).
     Props (0.17.0, optional): form (array of attributes merged onto the <form>, e.g. ['wire:submit' => 'login']; it can override action / method; with it a non-GET form gets @csrf); heading-level (1 default; 2 renders the title as an h2 with the same look).
--}}
@props(['form' => null, 'headingLevel' => 1, 'panel' => null, 'title' => null, 'text' => null, 'fields' => null, 'footer' => null])
@php
    $ocForm = (new \Illuminate\View\ComponentAttributeBag(is_array($form) ? $form : []))->merge(['class' => 'oc-block-authcard oc-block-authcard--flat', 'action' => '#', 'method' => 'post']);
    $ocHeading = (int) $headingLevel === 2 ? 'h2' : 'h1';
@endphp
<div {{ $attributes->merge(['class' => 'oc-block-authduo']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <div class="oc-block-authduo-grid">
    @if (isset($panel) && trim((string) $panel) !== '')
        {{ $panel }}
    @else
    <aside class="oc-block-authduo-panel oc-block-authduo-panel--muted">
      <a class="oc-block-authduo-logo" href="#"><svg data-icon="mdi:layers-outline" class="" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 18.54l7.37-5.74L21 14.07l-9 7l-9-7l1.62-1.26zM12 16L3 9l9-7l9 7zm0-11.47L6.26 9L12 13.47L17.74 9z"/></svg> Company 1</a>
      <blockquote class="oc-block-authduo-quote">
        <p>&ldquo;Two-step verification keeps our client data where it belongs.&rdquo;</p>
        <footer>Security team</footer>
      </blockquote>
    </aside>
    @endif
    <div class="oc-block-authduo-form">
      <form {{ $ocForm }}>
          @if (is_array($form) && strtolower((string) $ocForm->get('method', 'get')) !== 'get') @csrf @endif
        <div class="oc-block-authcard-head">
          <{{ $ocHeading }} class="oc-block-authcard-title">
              @if (isset($title) && trim((string) $title) !== '')
                  {{ $title }}
              @else
              Verify your login
              @endif
          </{{ $ocHeading }}>
          <p class="oc-block-authcard-text">
              @if (isset($text) && trim((string) $text) !== '')
                  {{ $text }}
              @else
              Enter the code from your authenticator app
              @endif
          </p>
        </div>
        <div class="oc-block-authcard-fields">
            @if (isset($fields) && trim((string) $fields) !== '')
                {{ $fields }}
            @else
          <div class="oc-field">
            <label class="oc-field-label" for="oc-otp02-code">Verification code</label>
            <input class="oc-otp" id="oc-otp02-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*" style="--oc-otp-length: 6" value="482">
            <p class="oc-field-description">Enter the 6-digit code we sent to your authenticator app.</p>
          </div>
          <button class="oc-btn oc-block-authcard-submit" type="submit">Verify</button>
            @endif
        </div>
        <p class="oc-block-authcard-foot">
            @if (isset($footer) && trim((string) $footer) !== '')
                {{ $footer }}
            @else
            Lost your device? <a href="#">Use a recovery code</a>
            @endif
        </p>
      </form>
    </div>
  </div>
    @endif
</div>
