{{-- OmniaUI block: site-header — Sticky header that turns into glass after scrolling; mobile menu via popover. No JavaScript. Needs @birdycom/omniaui.
     Blade: <x-oc::block.site-header> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): brand, nav.
--}}
@props(['brand' => null, 'nav' => null])
<header {{ $attributes->merge(['class' => 'oc-site-header']) }}>
  <div class="oc-container oc-site-header__inner">
    <a class="oc-site-header__brand" href="/">
        @if (isset($brand) && trim((string) $brand) !== '')
            {{ $brand }}
        @else
        <span class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">&#9670;</span>brand<span class="oc-text-gradient">co</span>
        @endif
    </a>
    <button class="oc-site-header__toggle" popovertarget="site-nav" aria-label="Menu">&#9776;</button>
    <nav class="oc-site-header__nav" id="site-nav" popover aria-label="Main">
        @if (isset($nav) && trim((string) $nav) !== '')
            {{ $nav }}
        @else
      <a href="#software" aria-current="page">Software</a>
      <a href="#work">Work</a>
      <a href="#services">Services</a>
      <a href="#about">About</a>
      <a class="oc-btn oc-btn--gradient oc-btn--sm" href="#contact">Start a project</a>
        @endif
    </nav>
  </div>
</header>
