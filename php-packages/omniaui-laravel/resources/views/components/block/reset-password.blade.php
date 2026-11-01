{{-- OmniaUI block: reset-password - Choose a new password: password with reveal, confirmation, a rules hint and submit. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
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
     Blade: <x-oc::block.reset-password> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): default.
--}}
<div {{ $attributes->merge(['class' => 'oc-block-authpage oc-block-authpage--plain']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <form class="oc-block-authcard" action="#" method="post">
    <span class="oc-block-authcard-logo"><svg data-icon="mdi:lock-outline" class="" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 17a2 2 0 0 1-2-2c0-1.11.89-2 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2m6 3V10H6v10zm0-12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10c0-1.11.89-2 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"/></svg></span>
    <div class="oc-block-authcard-head">
      <h1 class="oc-block-authcard-title">Set a new password</h1>
      <p class="oc-block-authcard-text">Your new password must differ from earlier ones</p>
    </div>
    <div class="oc-block-authcard-fields">
      <div class="oc-field">
        <label class="oc-field-label" for="oc-reset-password">New password</label>
        <div class="oc-input-reveal">
          <input class="oc-input" id="oc-reset-password" name="oc-reset-password" type="password" autocomplete="new-password" required>
          <button class="oc-input-reveal-button" type="button" aria-pressed="false" aria-label="Toggle password visibility">Show</button>
        </div>
      </div>
      <div class="oc-field">
        <label class="oc-field-label" for="oc-reset-confirm">Confirm password</label>
        <div class="oc-input-reveal">
          <input class="oc-input" id="oc-reset-confirm" name="oc-reset-confirm" type="password" autocomplete="new-password" required>
          <button class="oc-input-reveal-button" type="button" aria-pressed="false" aria-label="Toggle password visibility">Show</button>
        </div>
      </div>
      <p class="oc-block-authcard-hint">At least 8 characters, with a number and a symbol.</p>
      <button class="oc-btn oc-block-authcard-submit" type="submit">Reset password</button>
    </div>
    <p class="oc-block-authcard-foot"><a href="#">Back to sign in</a></p>
  </form>
    @endif
</div>
