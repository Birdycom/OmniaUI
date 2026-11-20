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
      What we do
      @endif
  </h2>
  <p>
      @if (isset($text) && trim((string) $text) !== '')
          {{ $text }}
      @else
      Four services from one team, with one contact person.
      @endif
  </p>
  <div class="oc-block-features-grid">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @else
    <div class="oc-block-feature-card">
      <div class="oc-block-feature-icon"><x-oc::webicon name="mdi:application-cog-outline" bare fallback="iconify" /></div>
      <h3>Business apps</h3>
      <p>Software built around how your company works.</p>
    </div>
    <div class="oc-block-feature-card">
      <div class="oc-block-feature-icon"><x-oc::webicon name="mdi:web" bare fallback="iconify" /></div>
      <h3>Websites</h3>
      <p>Fast sites that you edit yourself, without a developer.</p>
    </div>
    <!-- ... more cards ... -->
      @endif
  </div>
</div>
