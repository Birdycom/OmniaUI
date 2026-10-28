{{-- OmniaUI block: auth-split - Sign-in with a brand panel (logo, quote) next to the form. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-authsplit: Grid root (two columns from 62rem)
       .oc-block-authsplit-brand: Left brand panel (primary gradient). Modifier --photo with style="--oc-authsplit-photo: url(…)" for a photo under a dark layer
       .oc-block-authsplit-logo: Logo link
       .oc-block-authsplit-quote: Quote (blockquote with p + footer)
       .oc-block-authsplit-form: Right column that centers the card
       .oc-block-authsplit-card: Form width limiter
       .oc-block-authsplit-title / -subtitle: Heading and sub line
       .oc-block-authsplit-fields / -row: Field stack and a justified row (remember me / forgot password)
     Slots: logo, quote, title, subtitle, fields, submit, footer link
     Blade: <x-oc::block.auth-split> - attributes merge onto the root element; props: action => #, method => post.
     Blade slots (each falls back to the snippet content when empty): logo, quote, title, subtitle, fields.
--}}
@props(['action' => '#', 'method' => 'post', 'logo' => null, 'quote' => null, 'title' => null, 'subtitle' => null, 'fields' => null])
<div {{ $attributes->merge(['class' => 'oc-block-authsplit']) }}>
  <aside class="oc-block-authsplit-brand">
    <a class="oc-block-authsplit-logo" href="#">
        @if (isset($logo) && trim((string) $logo) !== '')
            {{ $logo }}
        @else
        <svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg> OmniaDesk
        @endif
    </a>
    <blockquote class="oc-block-authsplit-quote">
        @if (isset($quote) && trim((string) $quote) !== '')
            {{ $quote }}
        @else
      <p>&ldquo;One calm place for contacts, invoices and the day-to-day work.&rdquo;</p>
      <footer>Serge Cools, founder</footer>
        @endif
    </blockquote>
  </aside>
  <div class="oc-block-authsplit-form">
    <form class="oc-block-authsplit-card" action="{{ $action }}" method="{{ $method }}">@unless (strtolower($method) === 'get') @csrf @endunless
      <h1 class="oc-block-authsplit-title">
          @if (isset($title) && trim((string) $title) !== '')
              {{ $title }}
          @else
          Welcome back
          @endif
      </h1>
      <p class="oc-block-authsplit-subtitle">
          @if (isset($subtitle) && trim((string) $subtitle) !== '')
              {{ $subtitle }}
          @else
          Sign in to your workspace
          @endif
      </p>
      <div class="oc-block-authsplit-fields">
          @if (isset($fields) && trim((string) $fields) !== '')
              {{ $fields }}
          @else
        <div class="oc-field">
          <label class="oc-field-label" for="oc-authsplit-email">E-mail</label>
          <input class="oc-input" id="oc-authsplit-email" name="email" type="email" autocomplete="username" placeholder="name@company.com" required>
        </div>
        <div class="oc-field">
          <label class="oc-field-label" for="oc-authsplit-password">Password</label>
          <div class="oc-input-reveal">
            <input class="oc-input" id="oc-authsplit-password" name="password" type="password" autocomplete="current-password" required>
            <button class="oc-input-reveal-button" type="button" aria-pressed="false" aria-label="Toggle password visibility">Show</button>
          </div>
        </div>
        <div class="oc-block-authsplit-row">
          <label><input class="oc-checkbox" type="checkbox" name="remember"> Remember me</label>
          <a class="oc-link" href="#">Forgot password?</a>
        </div>
        <button class="oc-btn" type="submit" style="width:100%">Sign in</button>
          @endif
      </div>
    </form>
  </div>
</div>
