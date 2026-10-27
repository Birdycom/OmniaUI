{{-- OmniaUI block: spotlight — Highlighted flagship product: badge, big title with icon tile, tagline, copy, button and a module list. Needs @birdycom/omniaui.
     Blade: <x-oc::block.spotlight> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): default.
--}}
<section {{ $attributes->merge(['class' => 'oc-section-pad']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <div class="oc-container">
    <div class="oc-spotlight oc-accent--green">
      <div>
        <span class="oc-pill oc-pill--accent"><span class="oc-status-dot"></span>Our flagship</span>
        <h2 class="oc-spotlight__title"><span class="oc-icon-tile oc-icon-tile--lg" aria-hidden="true">&#9670;</span>OmniaDesk</h2>
        <p class="oc-spotlight__tagline">The modular ERP for small businesses</p>
        <p class="oc-lead">One web application for CRM, sales, invoicing, bookkeeping and stock - built from integrated modules, so your data never lives on separate islands again.</p>
        <a class="oc-btn oc-btn--gradient oc-btn--lg" href="#">Discover OmniaDesk &rarr;</a>
      </div>
      <ul class="oc-spotlight__modules">
        <li><span class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">&#9787;</span>CRM &amp; contacts</li>
        <li><span class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">&#8364;</span>Sales &amp; invoicing</li>
        <li><span class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">&#9636;</span>Finance</li>
        <li><span class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">&#9635;</span>Stock &amp; catalogue</li>
        <li><span class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">&#9776;</span>Powerful lists</li>
        <li><span class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">&#9737;</span>Secure by design</li>
      </ul>
    </div>
  </div>
    @endif
</section>
