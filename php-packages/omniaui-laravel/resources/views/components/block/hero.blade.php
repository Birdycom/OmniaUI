{{-- OmniaUI block: hero — Centered hero with badge, headline, text and actions. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Blade: <x-oc::block.hero> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): badge, title, text, actions.
     Props (0.17.0, optional): heading-level (1 default; 2 renders the title as an h2 with the same look).
--}}
@props(['headingLevel' => 1, 'badge' => null, 'title' => null, 'text' => null, 'actions' => null])
@php
    $ocHeading = (int) $headingLevel === 2 ? 'h2' : 'h1';
@endphp
<div {{ $attributes->merge(['class' => 'oc-block-hero']) }}>
  <span class="oc-block-hero-badge">
      @if (isset($badge) && trim((string) $badge) !== '')
          {{ $badge }}
      @else
      New: purchase orders
      @endif
  </span>
  <{{ $ocHeading }}>
      @if (isset($title) && trim((string) $title) !== '')
          {{ $title }}
      @else
      Quotes, invoices and stock in one app
      @endif
  </{{ $ocHeading }}>
  <p>
      @if (isset($text) && trim((string) $text) !== '')
          {{ $text }}
      @else
      Company 1 builds business software for small teams: one web application instead of five separate tools.
      @endif
  </p>
  <div class="oc-block-hero-actions">
      @if (isset($actions) && trim((string) $actions) !== '')
          {{ $actions }}
      @else
    <button class="oc-btn oc-btn--lg">Book a demo</button>
    <button class="oc-btn oc-btn--outline oc-btn--lg">See the modules</button>
      @endif
  </div>
</div>
