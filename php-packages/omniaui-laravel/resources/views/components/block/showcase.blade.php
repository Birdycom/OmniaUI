{{-- OmniaUI block: showcase — Portfolio grid: project cards with a browser frame around the screenshot. Needs @birdycom/omniaui.
     Blade: <x-oc::block.showcase> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): default.
--}}
<section {{ $attributes->merge(['class' => 'oc-section-pad']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <div class="oc-container">
    <p class="oc-eyebrow">Work</p>
    <h2 class="oc-display oc-display--md">Websites made to measure. Different for every client.</h2>
    <div class="oc-card-grid" style="--oc-card-min: 20rem;">
      <a class="oc-product-card oc-accent--green p-0 overflow-hidden" href="#">
        <span class="oc-browser-frame m-1"><span class="oc-browser-frame__bar"><i></i><i></i><i></i></span><span class="oc-browser-frame__body oc-media-art oc-media-art--4"></span></span>
        <span class="grid gap-0.5 p-1.5 pt-0">
          <span class="oc-pill oc-pill--accent justify-self-start">Website with CMS</span>
          <span class="oc-product-card__name">Project 1</span>
          <span class="oc-product-card__summary">Garden design and maintenance</span>
          <span class="oc-product-card__more">View the project</span>
        </span>
      </a>
      <a class="oc-product-card oc-accent--blue p-0 overflow-hidden" href="#">
        <span class="oc-browser-frame m-1"><span class="oc-browser-frame__bar"><i></i><i></i><i></i></span><span class="oc-browser-frame__body oc-media-art"></span></span>
        <span class="grid gap-0.5 p-1.5 pt-0">
          <span class="oc-pill oc-pill--accent justify-self-start">Custom website</span>
          <span class="oc-product-card__name">Project 2</span>
          <span class="oc-product-card__summary">Plumbing and central heating</span>
          <span class="oc-product-card__more">View the project</span>
        </span>
      </a>
    </div>
  </div>
    @endif
</section>
