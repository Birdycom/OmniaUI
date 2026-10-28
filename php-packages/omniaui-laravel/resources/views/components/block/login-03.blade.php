{{-- OmniaUI block: login-03 - Card on a muted page with social sign-in buttons above the e-mail form. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
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
     Blade: <x-oc::block.login-03> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): default.
--}}
<div {{ $attributes->merge(['class' => 'oc-block-authpage']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <form class="oc-block-authcard" action="#" method="post">
    <span class="oc-block-authcard-logo"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/></svg></span>
    <div class="oc-block-authcard-head">
      <h1 class="oc-block-authcard-title">Welcome back</h1>
      <p class="oc-block-authcard-text">Login with your Apple or Google account</p>
    </div>
    <div class="oc-block-authsocial">
      <button class="oc-btn oc-btn--outline" type="button">Apple</button>
      <button class="oc-btn oc-btn--outline" type="button">Google</button>
    </div>
    <div class="oc-separator-text">Or continue with</div>
    <div class="oc-block-authcard-fields">
      <div class="oc-field">
        <label class="oc-field-label" for="oc-login03-email">E-mail</label>
        <input class="oc-input" id="oc-login03-email" name="email" type="email" autocomplete="username" required placeholder="name@company.com">
      </div>
      <div class="oc-field">
        <label class="oc-field-label" for="oc-login03-password">Password</label>
        <div class="oc-input-reveal">
          <input class="oc-input" id="oc-login03-password" name="oc-login03-password" type="password" autocomplete="current-password" required>
          <button class="oc-input-reveal-button" type="button" aria-pressed="false" aria-label="Toggle password visibility">Show</button>
        </div>
      </div>
      <button class="oc-btn oc-block-authcard-submit" type="submit">Login</button>
    </div>
    <p class="oc-block-authcard-foot">Don't have an account? <a href="#">Sign up</a></p>
    <p class="oc-block-authcard-legal">By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
  </form>
    @endif
</div>
