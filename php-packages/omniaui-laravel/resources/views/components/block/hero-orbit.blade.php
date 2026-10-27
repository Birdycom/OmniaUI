{{-- OmniaUI block: hero-orbit - Landing hero with a code window and product marks that slowly orbit around it. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/hero-orbit.html | Map: section -> container + split -> copy (eyebrow, display, lead, buttons) -> visual (ring with marks + center window)
     Class API: .oc-block-orbit-visual (square stage), -ring (turning circle), -mark (style="--oc-orbit-angle: 60deg"),
       -center (the code window or any visual). --oc-orbit-duration sets the speed (default 60s). Reduced motion: no orbit.
       Copy uses the showcase classes (.oc-eyebrow, .oc-display, .oc-text-gradient, .oc-lead, .oc-btn--gradient / --glass).
     Blade: <x-oc::block.hero-orbit> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): eyebrow, title, lead, actions, center, default.
--}}
@props(['eyebrow' => null, 'title' => null, 'lead' => null, 'actions' => null, 'center' => null])
<section {{ $attributes->merge(['class' => 'oc-block-orbit oc-section-pad']) }}>
  <div class="oc-container oc-split">
    <div>
      <p class="oc-eyebrow">
          @if (isset($eyebrow) && trim((string) $eyebrow) !== '')
              {{ $eyebrow }}
          @else
          Software studio &middot; since 2012
          @endif
      </p>
      <h1 class="oc-display">
          @if (isset($title) && trim((string) $title) !== '')
              {{ $title }}
          @else
          One team for all your <span class="oc-text-gradient">software</span>.
          @endif
      </h1>
      <p class="oc-lead">
          @if (isset($lead) && trim((string) $lead) !== '')
              {{ $lead }}
          @else
          Business apps, websites and desktop tools. We design, build and maintain them, and stay your single point of contact.
          @endif
      </p>
      <div class="flex flex-wrap gap-1 mt-2">
          @if (isset($actions) && trim((string) $actions) !== '')
              {{ $actions }}
          @else
        <a class="oc-btn oc-btn--gradient oc-btn--lg" href="#products">See our products &rarr;</a>
        <a class="oc-btn oc-btn--glass oc-btn--lg" href="#contact">Start a project</a>
          @endif
      </div>
    </div>
    <div class="oc-block-orbit-visual">
      <div class="oc-block-orbit-ring" aria-hidden="true">
          @if (! $slot->isEmpty())
              {{ $slot }}
          @else
        <span class="oc-block-orbit-mark" style="--oc-orbit-angle: 0deg;"><span class="oc-product-mark oc-product-mark--sm oc-accent--green">&#9670;</span></span>
        <span class="oc-block-orbit-mark" style="--oc-orbit-angle: 60deg;"><span class="oc-product-mark oc-product-mark--sm oc-accent--violet">&#9673;</span></span>
        <span class="oc-block-orbit-mark" style="--oc-orbit-angle: 120deg;"><span class="oc-product-mark oc-product-mark--sm oc-accent--orange">&#9650;</span></span>
        <span class="oc-block-orbit-mark" style="--oc-orbit-angle: 180deg;"><span class="oc-product-mark oc-product-mark--sm oc-accent--cyan">&#9733;</span></span>
        <span class="oc-block-orbit-mark" style="--oc-orbit-angle: 240deg;"><span class="oc-product-mark oc-product-mark--sm oc-accent--red">&#9829;</span></span>
        <span class="oc-block-orbit-mark" style="--oc-orbit-angle: 300deg;"><span class="oc-product-mark oc-product-mark--sm oc-accent--yellow">&#9728;</span></span>
          @endif
      </div>
      <div class="oc-code-window oc-block-orbit-center">
          @if (isset($center) && trim((string) $center) !== '')
              {{ $center }}
          @else
        <div class="oc-code-window__bar"><i></i><i></i><i></i><span class="oc-code-window__title">products.php</span></div>
<pre class="oc-code-window__body">return [
  'erp'    => AcmeDesk::class,
  'shop'   => AcmeShop::class,
  'design' => AcmeDesign::class,
  'next'   => YourProject::class,
];</pre>
          @endif
      </div>
    </div>
  </div>
</section>
