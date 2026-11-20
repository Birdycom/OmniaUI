{{-- File: resources/views/components/topbar.blade.php | Map: optional strip -> header.oc-topbar (variant, center, plain, fixed) -> brand (logo + name) -> checkbox toggle + burger -> nav (navmenu links) -> actions
     OmniaUI topbar: site bar with brand, menu (.oc-navmenu--site), actions and a burger menu without JavaScript (checkbox).
     Props: brand (text; or slot brand), brand-href ('/'), logo (webicon name in .oc-topbar-logo), links ([['label', 'href', 'current', 'icon' => webicon for an
     icon-only link; the label becomes its aria-label]]), variant (dark|brand|floating), center, plain, fixed, collapsible (true), id (checkbox id),
     menu-label ('Toggle menu'), nav-label ('Main'). Slots: default (replaces the navmenu inside the nav), actions (.oc-topbar-actions),
     strip (.oc-topbar-strip above the bar). Attributes merge onto the header. --}}
@props(['brand' => null, 'brandHref' => '/', 'logo' => null, 'links' => [], 'variant' => null, 'center' => false, 'plain' => false, 'fixed' => false, 'collapsible' => true, 'id' => null, 'menuLabel' => 'Toggle menu', 'navLabel' => 'Main', 'actions' => null, 'strip' => null])
@php($toggleId = $id ?? 'oc-topbar-'.substr(md5(uniqid('', true)), 0, 8))
@if (isset($strip) && trim((string) $strip) !== '')
<div class="oc-topbar-strip">{{ $strip }}</div>
@endif
<header {{ $attributes->class(['oc-topbar', 'oc-topbar--collapsible' => $collapsible, 'oc-topbar--'.$variant => (bool) $variant, 'oc-topbar--center' => $center, 'oc-topbar--plain' => $plain, 'oc-topbar--fixed' => $fixed]) }}>
  <a class="oc-topbar-brand" href="{{ $brandHref }}">@if ($logo)<span class="oc-topbar-logo" aria-hidden="true"><x-oc::webicon :name="$logo" bare fallback="iconify" /></span>@endif{{ $brand }}</a>
  @if ($collapsible)
  <input type="checkbox" id="{{ $toggleId }}" class="oc-topbar-toggle" aria-label="{{ $menuLabel }}">
  <label class="oc-topbar-burger" for="{{ $toggleId }}" aria-hidden="true">&#9776;</label>
  @endif
  <nav class="oc-topbar-nav" aria-label="{{ $navLabel }}">
    @if (! $slot->isEmpty())
    {{ $slot }}
    @else
    <ul class="oc-navmenu oc-navmenu--site">
      @foreach ($links as $link)
      <li><a class="oc-navmenu-link" href="{{ $link['href'] ?? '#' }}" @if (! empty($link['current'])) aria-current="page" @endif @if (! empty($link['icon'])) aria-label="{{ $link['label'] ?? '' }}" @endif>@if (! empty($link['icon']))<x-oc::webicon :name="$link['icon']" class="oc-navmenu-icon" bare fallback="iconify" />@else{{ $link['label'] ?? '' }}@endif</a></li>
      @endforeach
    </ul>
    @endif
  </nav>
  @if (isset($actions) && trim((string) $actions) !== '')
  <div class="oc-topbar-actions">{{ $actions }}</div>
  @endif
</header>
