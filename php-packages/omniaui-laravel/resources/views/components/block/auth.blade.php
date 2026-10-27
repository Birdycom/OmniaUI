{{-- OmniaUI block: auth — Sign-in card. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Blade: <x-oc::block.auth> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): footer, default.
--}}
@props(['footer' => null])
<div {{ $attributes->merge(['class' => 'oc-block-auth']) }}>
  <div class="oc-block-auth-card">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @else
    <h2>Sign in</h2>
    <p class="oc-block-subtitle">Enter your credentials to continue</p>
    <div class="oc-form-group">
      <label class="oc-label">Email</label>
      <input class="oc-input" type="email" placeholder="name@company.com">
    </div>
    <div class="oc-form-group">
      <label class="oc-label">Password</label>
      <input class="oc-input" type="password" placeholder="********">
    </div>
    <button class="oc-btn" style="width:100%;">Sign in</button>
    <div class="oc-block-auth-divider">or continue with</div>
    <button class="oc-btn oc-btn--outline" style="width:100%;">Sign in with Google</button>
      @endif
  </div>
  <div class="oc-block-auth-footer">
      @if (isset($footer) && trim((string) $footer) !== '')
          {{ $footer }}
      @else
    Don't have an account? <a href="#">Sign up</a>
      @endif
  </div>
</div>
