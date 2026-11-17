{{-- OmniaUI block: pricing — Pricing cards with a featured plan. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Blade: <x-oc::block.pricing> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): title, text, default.
--}}
@props(['title' => null, 'text' => null])
<div {{ $attributes->merge(['class' => 'oc-block-pricing']) }}>
  <h2>
      @if (isset($title) && trim((string) $title) !== '')
          {{ $title }}
      @else
      Plans and prices
      @endif
  </h2>
  <p>
      @if (isset($text) && trim((string) $text) !== '')
          {{ $text }}
      @else
      Prices per month, excluding VAT. Change or stop at the end of any month.
      @endif
  </p>
  <div class="oc-block-pricing-grid">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @else
    <div class="oc-block-pricing-card">
      <p class="oc-block-pricing-name">Free</p>
      <p class="oc-block-pricing-desc">For one user, to try it out</p>
      <p class="oc-block-pricing-price">&euro;0 <span>/month</span></p>
      <ul class="oc-block-pricing-features">
        <li>Quotes and invoices</li>
        <li>1 user</li>
        <li>Support by e-mail</li>
      </ul>
      <button class="oc-btn oc-btn--outline" style="width:100%;">Get started</button>
    </div>
    <div class="oc-block-pricing-card oc-block-pricing-card--featured">
      <p class="oc-block-pricing-name">Pro</p>
      <p class="oc-block-pricing-desc">For a team of up to 10 people</p>
      <p class="oc-block-pricing-price">&euro;29 <span>/month</span></p>
      <ul class="oc-block-pricing-features">
        <li>Everything in Free</li>
        <li>10 users</li>
        <li>Stock and purchasing</li>
        <li>Support by phone</li>
      </ul>
      <button class="oc-btn" style="width:100%;">Subscribe</button>
    </div>
    <div class="oc-block-pricing-card">
      <p class="oc-block-pricing-name">Enterprise</p>
      <p class="oc-block-pricing-desc">For larger companies</p>
      <p class="oc-block-pricing-price">Custom</p>
      <ul class="oc-block-pricing-features">
        <li>Everything in Pro</li>
        <li>Links to your other software</li>
        <li>A fixed contact person</li>
        <li>Agreed response times</li>
      </ul>
      <button class="oc-btn oc-btn--outline" style="width:100%;">Contact sales</button>
    </div>
      @endif
  </div>
</div>
