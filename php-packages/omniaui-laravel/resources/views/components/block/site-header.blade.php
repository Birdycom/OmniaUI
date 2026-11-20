{{-- OmniaUI block: site-header — Sticky header that turns into glass after scrolling; mobile menu via popover. No JavaScript. Needs @birdycom/omniaui.
     Blade: <x-oc::block.site-header> - attributes merge onto the root element (class="oc-site-header--container" folds at its own width).
     Props (all optional): brand-href ('/'), nav-id ('site-nav'), menu-label ('Menu'), nav-label ('Main'), menu-icon (webicon name for
       the menu button, e.g. mdi:menu), variant (center|dark|floating|glass), progress (reading-progress line .oc-site-header__progress),
       brand-mark (array: name, accent, tagline, size, label = aria-label of the link): a .oc-brand-mark as the logo link.
     Blade slots (each falls back to the snippet content when empty): brand, nav. Extra slots: actions (.oc-site-header__actions,
       right of the menu; only printed when given), brand-icon (svg/img of the brand mark).
     Hand-written (MANUAL in tools/build-blocks.mjs): keep the default output equal to packages/blocks/blocks/site-header.html.
--}}
@props(['brand' => null, 'nav' => null, 'actions' => null, 'brandIcon' => null, 'brandHref' => '/', 'brandMark' => null, 'navId' => 'site-nav', 'menuLabel' => 'Menu', 'navLabel' => 'Main', 'menuIcon' => null, 'variant' => null, 'progress' => false])
<header {{ $attributes->merge(['class' => 'oc-site-header'.($variant ? ' oc-site-header--'.$variant : '')]) }}>
  <div class="oc-container oc-site-header__inner">
    @if (is_array($brandMark))
    <x-oc::brand-mark :href="$brandHref" :name="$brandMark['name'] ?? ''" :accent="$brandMark['accent'] ?? null" :tagline="$brandMark['tagline'] ?? null" :size="$brandMark['size'] ?? 'md'" :aria-label="$brandMark['label'] ?? null">
        @if (isset($brandIcon) && trim((string) $brandIcon) !== '')
        <x-slot:icon>{{ $brandIcon }}</x-slot:icon>
        @endif
    </x-oc::brand-mark>
    @else
    <a class="oc-site-header__brand" href="{{ $brandHref }}">
        @if (isset($brand) && trim((string) $brand) !== '')
            {{ $brand }}
        @else
        <span class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">&#9670;</span>Company <span class="oc-text-gradient">1</span>
        @endif
    </a>
    @endif
    <button class="oc-site-header__toggle" popovertarget="{{ $navId }}" aria-label="{{ $menuLabel }}">@if ($menuIcon)<x-oc::webicon :name="$menuIcon" bare fallback="iconify" />@else&#9776;@endif</button>
    <nav class="oc-site-header__nav" id="{{ $navId }}" popover aria-label="{{ $navLabel }}">
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
    @if (isset($actions) && trim((string) $actions) !== '')
    <div class="oc-site-header__actions">{{ $actions }}</div>
    @endif
  </div>
  @if ($progress)
  <span class="oc-site-header__progress" aria-hidden="true"></span>
  @endif
</header>
