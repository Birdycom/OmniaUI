{{-- OmniaUI block: hero — Centered hero with badge, headline, text and actions. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Blade: <x-oc::block.hero> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): badge, title, text, actions.
--}}
@props(['badge' => null, 'title' => null, 'text' => null, 'actions' => null])
<div {{ $attributes->merge(['class' => 'oc-block-hero']) }}>
  <span class="oc-block-hero-badge">
      @if (isset($badge) && trim((string) $badge) !== '')
          {{ $badge }}
      @else
      New in v0.1.6
      @endif
  </span>
  <h1>
      @if (isset($title) && trim((string) $title) !== '')
          {{ $title }}
      @else
      Build faster with OmniaCSS
      @endif
  </h1>
  <p>
      @if (isset($text) && trim((string) $text) !== '')
          {{ $text }}
      @else
      A utility-first CSS framework with component primitives and pre-composed blocks for modern web apps.
      @endif
  </p>
  <div class="oc-block-hero-actions">
      @if (isset($actions) && trim((string) $actions) !== '')
          {{ $actions }}
      @else
    <button class="oc-btn oc-btn--lg">Get started</button>
    <button class="oc-btn oc-btn--outline oc-btn--lg">View docs</button>
      @endif
  </div>
</div>
