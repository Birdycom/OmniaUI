{{-- OmniaUI block: stats — Key figures row. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Blade: <x-oc::block.stats> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): default.
--}}
<div {{ $attributes->merge(['class' => 'oc-block-stats']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <div class="oc-block-stat">
    <div class="oc-block-stat-value">100K+</div>
    <div class="oc-block-stat-label">CSS utility classes</div>
  </div>
  <div class="oc-block-stat">
    <div class="oc-block-stat-value">14</div>
    <div class="oc-block-stat-label">Component primitives</div>
  </div>
  <div class="oc-block-stat">
    <div class="oc-block-stat-value">8</div>
    <div class="oc-block-stat-label">Block compositions</div>
  </div>
  <div class="oc-block-stat">
    <div class="oc-block-stat-value">3</div>
    <div class="oc-block-stat-label">Color palettes</div>
  </div>
    @endif
</div>
