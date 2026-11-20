{{-- OmniaUI block: hero-split — Hero with text left and visual right. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Blade: <x-oc::block.hero-split> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): title, text, actions, visual.
     Props (0.17.0, optional): heading-level (1 default; 2 renders the title as an h2 with the same look).
--}}
@props(['headingLevel' => 1, 'title' => null, 'text' => null, 'actions' => null, 'visual' => null])
@php
    $ocHeading = (int) $headingLevel === 2 ? 'h2' : 'h1';
@endphp
<div {{ $attributes->merge(['class' => 'oc-block-hero-split']) }}>
  <div>
    <{{ $ocHeading }}>
        @if (isset($title) && trim((string) $title) !== '')
            {{ $title }}
        @else
        Ship products, not CSS
        @endif
    </{{ $ocHeading }}>
    <p>
        @if (isset($text) && trim((string) $text) !== '')
            {{ $text }}
        @else
        Stop writing repetitive styles. Use pre-built utilities and components to move fast.
        @endif
    </p>
    <div class="oc-block-hero-actions justify-start">
        @if (isset($actions) && trim((string) $actions) !== '')
            {{ $actions }}
        @else
      <button class="oc-btn">Start building</button>
      <button class="oc-btn oc-btn--ghost">Learn more</button>
        @endif
    </div>
  </div>
  <div class="oc-block-hero-visual">
      @if (isset($visual) && trim((string) $visual) !== '')
          {{ $visual }}
      @else
      Preview / Image placeholder
      @endif
  </div>
</div>
