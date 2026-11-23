{{-- OmniaUI block: app-header - Top bar with sidebar toggle, module navigation and user actions. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-appbar: Bar (flex row)
       .oc-block-appbar-nav: Navigation area; contains an .oc-navmenu
       .oc-block-appbar-search: Search field between the navigation and the actions (0.17.0)
       .oc-block-appbar-actions: Right-aligned actions (theme switch, switchers, user menu)
       .oc-block-appbar-title: Optional page title
     Slots: toggle, module nav, search, actions (theme switch, workspace select, user dropdown)
     Blade: <x-oc::block.app-header> - attributes merge onto the root element; props: toggleFor => oc-appbar-toggle.
     Blade slots (each falls back to the snippet content when empty): toggle, nav, actions; search (0.17.0, empty by default;
     search-collapse (0.17.1): on a narrow bar it shrinks to a magnifier and opens over the bar on focus).
     0.17.0 (written by hand, not generated): overflow (links that do not fit go into a "More" menu; needs
     <script type="module" src="/js/oc-nav-overflow.js"></script>, `npx omniaui copy-js nav-overflow`), more-label (default
     "More"), nav-label (aria-label of the nav), module (data-module on the bar).
--}}
@props(['toggleFor' => 'oc-appbar-toggle', 'toggle' => null, 'nav' => null, 'actions' => null, 'search' => null, 'searchCollapse' => false, 'overflow' => false, 'moreLabel' => 'More', 'navLabel' => 'Module navigation', 'module' => null])
@php($moreId = 'oc-appbar-more-'.substr(md5(uniqid('', true)), 0, 6))
<header {{ $attributes->merge(['class' => 'oc-block-appbar', 'data-module' => $module]) }}>
  @if (isset($toggle) && trim((string) $toggle) !== '')
      {{ $toggle }}
  @else
  <label class="oc-btn oc-btn--ghost oc-btn--icon" for="{{ $toggleFor }}" title="Toggle sidebar"><svg data-icon="mdi:menu" class="" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg><span class="oc-visually-hidden">Toggle sidebar</span></label>
  @endif
  <nav class="oc-block-appbar-nav" aria-label="{{ $navLabel }}"@if ($overflow) data-oc-nav-overflow data-more-label="{{ $moreLabel }}"@endif>
      @if (isset($nav) && trim((string) $nav) !== '')
          {{ $nav }}
      @else
    <ul class="oc-navmenu">
      <li><a class="oc-navmenu-link" href="#" aria-current="page">Contacts</a></li>
      <li><a class="oc-navmenu-link" href="#">Companies</a></li>
      <li><a class="oc-navmenu-link" href="#">Segments</a></li>
      @if ($overflow)
      <li data-oc-nav-more data-oc-hidden aria-hidden="true"><button class="oc-navmenu-link oc-block-appbar-more" type="button" popovertarget="{{ $moreId }}" aria-haspopup="menu" tabindex="-1"><svg data-icon="mdi:dots-horizontal" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 12a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2m-6 0a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2"/></svg>{{ $moreLabel }}</button><div class="oc-dropdown-menu" id="{{ $moreId }}" role="menu" popover></div></li>
      @endif
    </ul>
      @endif
  </nav>
  @if (isset($search) && trim((string) $search) !== '')
  <div @class(['oc-block-appbar-search', 'oc-block-appbar-search--collapse' => $searchCollapse])>{{ $search }}</div>
  @endif
  <div class="oc-block-appbar-actions">
      @if (isset($actions) && trim((string) $actions) !== '')
          {{ $actions }}
      @else
    <div class="oc-theme-switch" role="radiogroup" aria-label="Theme">
      <label><input type="radio" name="oc-appbar-theme" value="light"> Light</label>
      <label><input type="radio" name="oc-appbar-theme" value="dark"> Dark</label>
    </div>
    <button class="oc-btn oc-btn--ghost oc-btn--icon" type="button" popovertarget="oc-appbar-user" aria-label="User menu"><span class="oc-avatar oc-avatar--sm">U1</span></button>
    <div class="oc-dropdown-menu" id="oc-appbar-user" popover>
      <div class="oc-dropdown-label">user1@company1.example</div>
      <a class="oc-dropdown-item" href="#">Profile</a>
      <a class="oc-dropdown-item" href="#">Settings</a>
      <div class="oc-dropdown-separator"></div>
      <a class="oc-dropdown-item" href="#">Log out</a>
    </div>
      @endif
  </div>
</header>
