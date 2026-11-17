{{-- OmniaUI block: stats — Key figures row. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Blade: <x-oc::block.stats> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): default.
--}}
<div {{ $attributes->merge(['class' => 'oc-block-stats']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <div class="oc-block-stat">
    <div class="oc-block-stat-value">12</div>
    <div class="oc-block-stat-label">Years in business</div>
  </div>
  <div class="oc-block-stat">
    <div class="oc-block-stat-value">140</div>
    <div class="oc-block-stat-label">Customers</div>
  </div>
  <div class="oc-block-stat">
    <div class="oc-block-stat-value">35</div>
    <div class="oc-block-stat-label">Apps in production</div>
  </div>
  <div class="oc-block-stat">
    <div class="oc-block-stat-value">4 h</div>
    <div class="oc-block-stat-label">Average response time</div>
  </div>
    @endif
</div>
