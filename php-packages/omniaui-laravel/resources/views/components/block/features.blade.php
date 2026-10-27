{{-- OmniaUI block: features — Feature grid with icons. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Blade: <x-oc::block.features> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): title, text, default.
--}}
@props(['title' => null, 'text' => null])
<div {{ $attributes->merge(['class' => 'oc-block-features']) }}>
  <h2>
      @if (isset($title) && trim((string) $title) !== '')
          {{ $title }}
      @else
      Everything you need
      @endif
  </h2>
  <p>
      @if (isset($text) && trim((string) $text) !== '')
          {{ $text }}
      @else
      Built for speed, customization and developer experience.
      @endif
  </p>
  <div class="oc-block-features-grid">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @else
    <div class="oc-block-feature-card">
      <div class="oc-block-feature-icon">&#9889;</div>
      <h3>Fast by default</h3>
      <p>Optimized CSS output with PostCSS and cssnano.</p>
    </div>
    <div class="oc-block-feature-card">
      <div class="oc-block-feature-icon">&#127912;</div>
      <h3>Themeable</h3>
      <p>CSS variables for every token. Swap colors, spacing and radii in one place.</p>
    </div>
    <!-- ... more cards ... -->
      @endif
  </div>
</div>
