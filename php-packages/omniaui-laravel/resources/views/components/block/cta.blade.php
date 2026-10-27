{{-- OmniaUI block: cta — Call to action banner. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Blade: <x-oc::block.cta> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): title, text, actions.
--}}
@props(['title' => null, 'text' => null, 'actions' => null])
<div {{ $attributes->merge(['class' => 'oc-block-cta']) }}>
  <h2>
      @if (isset($title) && trim((string) $title) !== '')
          {{ $title }}
      @else
      Ready to start building?
      @endif
  </h2>
  <p>
      @if (isset($text) && trim((string) $text) !== '')
          {{ $text }}
      @else
      Get OmniaCSS and ship your next project faster.
      @endif
  </p>
  <div class="oc-block-hero-actions">
      @if (isset($actions) && trim((string) $actions) !== '')
          {{ $actions }}
      @else
    <button class="oc-btn oc-btn--lg">Get started free</button>
      @endif
  </div>
</div>
