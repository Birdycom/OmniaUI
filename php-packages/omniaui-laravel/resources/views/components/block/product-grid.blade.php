{{-- OmniaUI block: product-grid — Section title + grid of product cards, each with its own accent color. Needs @birdycom/omniaui.
     Blade: <x-oc::block.product-grid> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): default.
--}}
<section {{ $attributes->merge(['class' => 'oc-section-pad']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <div class="oc-container">
    <p class="oc-eyebrow">Software</p>
    <h2 class="oc-display oc-display--md">Products, custom work and tools. <span class="oc-text-gradient">All our own work.</span></h2>
    <div class="oc-card-grid">
      <a class="oc-product-card oc-accent--green" href="#">
        <div class="oc-product-card__top"><span class="oc-icon-tile" aria-hidden="true">&#9670;</span><span class="oc-pill">Own product</span></div>
        <h3 class="oc-product-card__name">OmniaDesk</h3>
        <p class="oc-product-card__tagline">Modular ERP for small businesses</p>
        <p class="oc-product-card__summary">CRM, sales, invoicing, bookkeeping and stock in one web application.</p>
        <span class="oc-product-card__more">Discover OmniaDesk</span>
      </a>
      <a class="oc-product-card oc-accent--orange" href="#">
        <div class="oc-product-card__top"><span class="oc-icon-tile" aria-hidden="true">&#9874;</span><span class="oc-pill">Custom work</span></div>
        <h3 class="oc-product-card__name">Korrekt Hub</h3>
        <p class="oc-product-card__tagline">Custom platform for interior builders</p>
        <p class="oc-product-card__summary">Work orders, projects, quotes, stock, planning and HR in one app.</p>
        <span class="oc-product-card__more">Discover Korrekt Hub</span>
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
        <h3 class="oc-product-card__name">HistoryTabs</h3>
        <p class="oc-product-card__tagline">Never lose your tabs again</p>
        <p class="oc-product-card__summary">A Windows tool that brings back browser windows with all their tabs.</p>
        <span class="oc-product-card__more">Discover HistoryTabs</span>
      </a>
    </div>
  </div>
    @endif
</section>
