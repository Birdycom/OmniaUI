{{-- OmniaUI block: otp-01 - Verification card: six-digit code, verify button and a resend link. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
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
     Blade: <x-oc::block.otp-01> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): default.
--}}
<div {{ $attributes->merge(['class' => 'oc-block-authpage oc-block-authpage--plain']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <form class="oc-block-authcard" action="#" method="post">
    <span class="oc-block-authcard-logo"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/></svg></span>
    <div class="oc-block-authcard-head">
      <h1 class="oc-block-authcard-title">Enter verification code</h1>
      <p class="oc-block-authcard-text">We sent a 6-digit code to your e-mail</p>
    </div>
    <div class="oc-block-authcard-fields">
      <div class="oc-field">
        <label class="oc-field-label" for="oc-otp01-code">Verification code</label>
        <input class="oc-otp" id="oc-otp01-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*" style="--oc-otp-length: 6">
        <p class="oc-field-description">Enter the 6-digit code we sent to name@company.com.</p>
      </div>
      <button class="oc-btn oc-block-authcard-submit" type="submit">Verify</button>
    </div>
    <p class="oc-block-authcard-foot">Didn't receive the code? <a href="#">Resend</a></p>
  </form>
    @endif
</div>
