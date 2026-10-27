{{-- OmniaUI block: page-hero — Page header (the oc-hero used on every docs page): eyebrow, title, text, actions. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Blade: <x-oc::block.page-hero> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): eyebrow, title, text, actions.
--}}
@props(['eyebrow' => null, 'title' => null, 'text' => null, 'actions' => null])
<section {{ $attributes->merge(['class' => 'oc-hero']) }}>
  <span class="oc-hero-eyebrow">
      @if (isset($eyebrow) && trim((string) $eyebrow) !== '')
          {{ $eyebrow }}
      @else
      Components
      @endif
  </span>
  <h1 class="oc-hero-title">
      @if (isset($title) && trim((string) $title) !== '')
          {{ $title }}
      @else
      Build interfaces with native HTML
      @endif
  </h1>
  <p class="oc-hero-text">
      @if (isset($text) && trim((string) $text) !== '')
          {{ $text }}
      @else
      Dialogs, menus and accordions without JavaScript — styled with OmniaCSS.
      @endif
  </p>
  <div class="oc-hero-actions">
      @if (isset($actions) && trim((string) $actions) !== '')
          {{ $actions }}
      @else
    <a class="oc-btn" href="#start">Get started</a>
    <a class="oc-btn oc-btn--outline" href="#docs">Documentation</a>
      @endif
  </div>
</section>
