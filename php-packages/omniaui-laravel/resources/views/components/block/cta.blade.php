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
      Want to see it with your own data?
      @endif
  </h2>
  <p>
      @if (isset($text) && trim((string) $text) !== '')
          {{ $text }}
      @else
      Send us one of your quotes and we show the whole flow, from quote to invoice, in half an hour.
      @endif
  </p>
  <div class="oc-block-hero-actions">
      @if (isset($actions) && trim((string) $actions) !== '')
          {{ $actions }}
      @else
    <button class="oc-btn oc-btn--lg">Plan a demo</button>
      @endif
  </div>
</div>
