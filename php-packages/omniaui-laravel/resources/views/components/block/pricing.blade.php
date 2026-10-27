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
      Simple, transparent pricing
      @endif
  </h2>
  <p>
      @if (isset($text) && trim((string) $text) !== '')
          {{ $text }}
      @else
      Choose the plan that fits your needs.
      @endif
  </p>
  <div class="oc-block-pricing-grid">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @else
    <div class="oc-block-pricing-card">
      <p class="oc-block-pricing-name">Free</p>
      <p class="oc-block-pricing-desc">For personal projects</p>
      <p class="oc-block-pricing-price">&euro;0 <span>/month</span></p>
      <ul class="oc-block-pricing-features">
        <li>Core utilities</li>
        <li>5 components</li>
        <li>Community support</li>
      </ul>
      <button class="oc-btn oc-btn--outline" style="width:100%;">Get started</button>
    </div>
    <div class="oc-block-pricing-card oc-block-pricing-card--featured">
      <p class="oc-block-pricing-name">Pro</p>
      <p class="oc-block-pricing-desc">For teams and businesses</p>
      <p class="oc-block-pricing-price">&euro;29 <span>/month</span></p>
      <ul class="oc-block-pricing-features">
        <li>All utilities + responsive</li>
        <li>All components</li>
        <li>All blocks</li>
        <li>Priority support</li>
      </ul>
      <button class="oc-btn" style="width:100%;">Subscribe</button>
    </div>
    <div class="oc-block-pricing-card">
      <p class="oc-block-pricing-name">Enterprise</p>
      <p class="oc-block-pricing-desc">Custom solutions</p>
      <p class="oc-block-pricing-price">Custom</p>
      <ul class="oc-block-pricing-features">
        <li>Everything in Pro</li>
        <li>Custom adapters</li>
        <li>Dedicated support</li>
        <li>SLA guarantee</li>
      </ul>
      <button class="oc-btn oc-btn--outline" style="width:100%;">Contact sales</button>
    </div>
      @endif
  </div>
</div>
