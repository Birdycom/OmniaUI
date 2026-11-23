{{-- OmniaUI block: product-grid — Section title + grid of product cards, each with its own accent color. Needs @birdycom/omniaui.
     File: packages/blocks/blocks/product-grid.html | Map: section -> container -> eyebrow, title -> .oc-card-grid of .oc-product-card links
     Blade: <x-oc::block.product-grid> - attributes merge onto the root element. Written by hand (array props).
     Props (same names as BlockProductGrid in React): eyebrow, title, products.
       products: list of ['href', 'accent', 'icon' (glyph or webicon name like mdi:package-variant), 'pill' (or 'tag'), 'name', 'tagline', 'summary', 'more'].
       Left out (null), eyebrow, title and products show the snippet content; :eyebrow="false" hides the eyebrow.
     Blade slots: title (HTML title), default (replaces the whole inside of the section).
--}}
@props(['eyebrow' => null, 'title' => null, 'products' => null])
@php($filled = fn ($v) => $v !== null && $v !== false && trim((string) $v) !== '')
<section {{ $attributes->merge(['class' => 'oc-section-pad']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <div class="oc-container">
    @if ($eyebrow !== false)
    <p class="oc-eyebrow">@if ($filled($eyebrow)){{ $eyebrow }}@else Software @endif</p>
    @endif
    <h2 class="oc-display oc-display--md">@if ($filled($title)){{ $title }}@else Products, custom work and tools. All our own work. @endif</h2>
    <div class="oc-card-grid">
      @if (is_array($products))
      @foreach ($products as $product)
      @php($pill = $product['pill'] ?? $product['tag'] ?? null)
      <a @class(['oc-product-card', 'oc-accent--'.($product['accent'] ?? '') => ! empty($product['accent'])]) href="{{ $product['href'] ?? '#' }}">
        <div class="oc-product-card__top">@if (! empty($product['icon']))<span class="oc-icon-tile" aria-hidden="true">@if (str_contains((string) $product['icon'], ':'))<x-oc::webicon :name="$product['icon']" bare fallback="iconify" />@else{{ $product['icon'] }}@endif</span>@endif @if (! empty($pill))<span class="oc-pill">{{ $pill }}</span>@endif</div>
        <h3 class="oc-product-card__name">{{ $product['name'] ?? '' }}</h3>
        @if (! empty($product['tagline']))
        <p class="oc-product-card__tagline">{{ $product['tagline'] }}</p>
        @endif
        @if (! empty($product['summary']))
        <p class="oc-product-card__summary">{{ $product['summary'] }}</p>
        @endif
        @if (! empty($product['more']))
        <span class="oc-product-card__more">{{ $product['more'] }}</span>
        @endif
      </a>
      @endforeach
      @else
      <a class="oc-product-card oc-accent--green" href="#">
        <div class="oc-product-card__top"><span class="oc-icon-tile" aria-hidden="true">&#9670;</span><span class="oc-pill">Own product</span></div>
        <h3 class="oc-product-card__name">Product 1</h3>
        <p class="oc-product-card__tagline">Modular ERP for small businesses</p>
        <p class="oc-product-card__summary">CRM, sales, invoicing, bookkeeping and stock in one web application.</p>
        <span class="oc-product-card__more">Discover Product 1</span>
      </a>
      <a class="oc-product-card oc-accent--orange" href="#">
        <div class="oc-product-card__top"><span class="oc-icon-tile" aria-hidden="true">&#9874;</span><span class="oc-pill">Custom work</span></div>
        <h3 class="oc-product-card__name">Product 2</h3>
        <p class="oc-product-card__tagline">Custom platform for interior builders</p>
        <p class="oc-product-card__summary">Work orders, projects, quotes, stock, planning and HR in one app.</p>
        <span class="oc-product-card__more">Discover Product 2</span>
      </a>
      <a class="oc-product-card oc-accent--violet" href="#">
        <div class="oc-product-card__top"><span class="oc-icon-tile" aria-hidden="true">&#9673;</span><span class="oc-pill">Framework</span></div>
        <h3 class="oc-product-card__name">OmniaCSS</h3>
        <p class="oc-product-card__tagline">The design system behind our apps</p>
        <p class="oc-product-card__summary">Utility-first CSS with ready components, blocks and more than 10,000 icons.</p>
        <span class="oc-product-card__more">Discover OmniaCSS</span>
      </a>
      <a class="oc-product-card oc-accent--cyan" href="#">
        <div class="oc-product-card__top"><span class="oc-icon-tile" aria-hidden="true">&#9638;</span><span class="oc-pill">Tool</span></div>
        <h3 class="oc-product-card__name">Product 3</h3>
        <p class="oc-product-card__tagline">Never lose your tabs again</p>
        <p class="oc-product-card__summary">A Windows tool that brings back browser windows with all their tabs.</p>
        <span class="oc-product-card__more">Discover Product 3</span>
      </a>
      @endif
    </div>
  </div>
    @endif
</section>
