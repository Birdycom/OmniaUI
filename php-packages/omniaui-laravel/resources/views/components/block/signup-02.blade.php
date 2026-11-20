{{-- OmniaUI block: signup-02 - Registration form next to a brand panel with a quote; the panel hides on narrow containers. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
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
     Blade: <x-oc::block.signup-02> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): panel, title, text, fields, footer, default.
     The default slot replaces the whole content; each named slot replaces one region (a plain string works too).
     Props (0.17.0, optional): form (array of attributes merged onto the <form>, e.g. ['wire:submit' => 'login']; it can override action / method; with it a non-GET form gets @csrf); heading-level (1 default; 2 renders the title as an h2 with the same look).
--}}
@props(['form' => null, 'headingLevel' => 1, 'panel' => null, 'title' => null, 'text' => null, 'fields' => null, 'footer' => null])
@php
    $ocForm = (new \Illuminate\View\ComponentAttributeBag(is_array($form) ? $form : []))->merge(['class' => 'oc-block-authcard oc-block-authcard--flat', 'action' => '#', 'method' => 'post']);
    $ocHeading = (int) $headingLevel === 2 ? 'h2' : 'h1';
@endphp
<div {{ $attributes->merge(['class' => 'oc-block-authduo oc-block-authduo--reverse']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <div class="oc-block-authduo-grid">
    @if (isset($panel) && trim((string) $panel) !== '')
        {{ $panel }}
    @else
    <aside class="oc-block-authduo-panel oc-block-authduo-panel--image">
      <a class="oc-block-authduo-logo" href="#"><svg data-icon="mdi:layers-outline" class="" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 18.54l7.37-5.74L21 14.07l-9 7l-9-7l1.62-1.26zM12 16L3 9l9-7l9 7zm0-11.47L6.26 9L12 13.47L17.74 9z"/></svg> Company 1</a>
      <blockquote class="oc-block-authduo-quote">
        <p>&ldquo;Setup took ten minutes and the whole team was on board by lunch.&rdquo;</p>
        <footer>Customer 3, product manager</footer>
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
              Create your account
              @endif
          </{{ $ocHeading }}>
          <p class="oc-block-authcard-text">
              @if (isset($text) && trim((string) $text) !== '')
                  {{ $text }}
              @else
              Free for 14 days, no card needed
              @endif
          </p>
        </div>
        <div class="oc-block-authcard-fields">
            @if (isset($fields) && trim((string) $fields) !== '')
                {{ $fields }}
            @else
          <div class="oc-field">
            <label class="oc-field-label" for="oc-signup02-name">Full name</label>
            <input class="oc-input" id="oc-signup02-name" name="text" type="text" autocomplete="name" required placeholder="Contact 1">
          </div>
          <div class="oc-field">
            <label class="oc-field-label" for="oc-signup02-email">E-mail</label>
            <input class="oc-input" id="oc-signup02-email" name="email" type="email" autocomplete="email" required placeholder="name@company1.example">
          </div>
          <div class="oc-field">
            <label class="oc-field-label" for="oc-signup02-password">Password</label>
            <div class="oc-input-reveal">
              <input class="oc-input" id="oc-signup02-password" name="oc-signup02-password" type="password" autocomplete="new-password" required>
              <button class="oc-input-reveal-button" type="button" aria-pressed="false" aria-label="Toggle password visibility">Show</button>
            </div>
          </div>
          <label><input class="oc-checkbox" type="checkbox" name="terms" required> I agree to the <a class="oc-link" href="#">terms</a></label>
          <button class="oc-btn oc-block-authcard-submit" type="submit">Create account</button>
            @endif
        </div>
        <p class="oc-block-authcard-foot">
            @if (isset($footer) && trim((string) $footer) !== '')
                {{ $footer }}
            @else
            Already registered? <a href="#">Sign in</a>
            @endif
        </p>
      </form>
    </div>
  </div>
    @endif
</div>
