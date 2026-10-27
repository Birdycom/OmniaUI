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
       .oc-block-authduo-grid / -panel / -form: Grid, brand panel (modifiers --image, --muted) and form column
       .oc-block-authduo-logo / -quote: Panel logo and quote
       .oc-block-authmin: Minimal centered column without a card
       .oc-separator-text: Divider with centered text (separator component)
       .oc-otp: Code input drawn as cells (component); set --oc-otp-length and maxlength
     Blade: <x-oc::block.otp-02> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): default.
--}}
<div {{ $attributes->merge(['class' => 'oc-block-authduo']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <div class="oc-block-authduo-grid">
    <aside class="oc-block-authduo-panel oc-block-authduo-panel--muted">
      <a class="oc-block-authduo-logo" href="#"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/></svg> OmniaDesk</a>
      <blockquote class="oc-block-authduo-quote">
        <p>&ldquo;Two-step verification keeps our client data where it belongs.&rdquo;</p>
        <footer>Security team</footer>
      </blockquote>
    </aside>
    <div class="oc-block-authduo-form">
      <form class="oc-block-authcard oc-block-authcard--flat" action="#" method="post">
        <div class="oc-block-authcard-head">
          <h1 class="oc-block-authcard-title">Verify your login</h1>
          <p class="oc-block-authcard-text">Enter the code from your authenticator app</p>
        </div>
        <div class="oc-block-authcard-fields">
          <div class="oc-field">
            <label class="oc-field-label" for="oc-otp02-code">Verification code</label>
            <input class="oc-otp" id="oc-otp02-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*" style="--oc-otp-length: 6" value="482">
            <p class="oc-field-description">Enter the 6-digit code we sent to your authenticator app.</p>
          </div>
          <button class="oc-btn oc-block-authcard-submit" type="submit">Verify</button>
        </div>
        <p class="oc-block-authcard-foot">Lost your device? <a href="#">Use a recovery code</a></p>
      </form>
    </div>
  </div>
    @endif
</div>
