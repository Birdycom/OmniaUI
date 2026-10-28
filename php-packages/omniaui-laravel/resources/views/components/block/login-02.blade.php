{{-- OmniaUI block: login-02 - Two columns: image/brand panel with a quote and the form on the other side; the panel hides when the block is narrow. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
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
     Blade: <x-oc::block.login-02> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): default.
--}}
<div {{ $attributes->merge(['class' => 'oc-block-authduo']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <div class="oc-block-authduo-grid">
    <aside class="oc-block-authduo-panel oc-block-authduo-panel--image">
      <a class="oc-block-authduo-logo" href="#"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/></svg> OmniaDesk</a>
      <blockquote class="oc-block-authduo-quote">
        <p>&ldquo;This workspace saved me hours of admin every week.&rdquo;</p>
        <footer>Sofia Davis, operations lead</footer>
      </blockquote>
    </aside>
    <div class="oc-block-authduo-form">
      <form class="oc-block-authcard oc-block-authcard--flat" action="#" method="post">
        <div class="oc-block-authcard-head">
          <h1 class="oc-block-authcard-title">Welcome back</h1>
          <p class="oc-block-authcard-text">Sign in to your workspace</p>
        </div>
        <div class="oc-block-authcard-fields">
          <div class="oc-field">
            <label class="oc-field-label" for="oc-login02-email">E-mail</label>
            <input class="oc-input" id="oc-login02-email" name="email" type="email" autocomplete="username" required placeholder="name@company.com">
          </div>
          <div class="oc-field">
            <label class="oc-field-label" for="oc-login02-password">Password</label>
            <div class="oc-input-reveal">
              <input class="oc-input" id="oc-login02-password" name="oc-login02-password" type="password" autocomplete="current-password" required>
              <button class="oc-input-reveal-button" type="button" aria-pressed="false" aria-label="Toggle password visibility">Show</button>
            </div>
          </div>
          <div class="oc-block-authcard-row">
            <label><input class="oc-checkbox" type="checkbox" name="remember"> Remember me</label>
            <a class="oc-link" href="#">Forgot password?</a>
          </div>
          <button class="oc-btn oc-block-authcard-submit" type="submit">Sign in</button>
        </div>
        <p class="oc-block-authcard-foot">No account yet? <a href="#">Create one</a></p>
      </form>
    </div>
  </div>
    @endif
</div>
