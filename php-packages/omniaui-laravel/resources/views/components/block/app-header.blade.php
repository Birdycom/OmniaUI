{{-- OmniaUI block: app-header - Top bar with sidebar toggle, module navigation and user actions. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-appbar: Bar (flex row)
       .oc-block-appbar-nav: Navigation area; contains an .oc-navmenu
       .oc-block-appbar-actions: Right-aligned actions (theme switch, switchers, user menu)
       .oc-block-appbar-title: Optional page title
     Slots: toggle, module nav, actions (theme switch, workspace select, user dropdown)
     Blade: <x-oc::block.app-header> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): toggle, nav, actions.
--}}
@props(['toggle' => null, 'nav' => null, 'actions' => null])
<header {{ $attributes->merge(['class' => 'oc-block-appbar']) }}>
  @if (isset($toggle) && trim((string) $toggle) !== '')
      {{ $toggle }}
  @else
  <label class="oc-btn oc-btn--ghost oc-btn--icon" for="oc-appbar-toggle" title="Toggle sidebar"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span class="oc-visually-hidden">Toggle sidebar</span></label>
  @endif
  <nav class="oc-block-appbar-nav" aria-label="Module navigation">
      @if (isset($nav) && trim((string) $nav) !== '')
          {{ $nav }}
      @else
    <ul class="oc-navmenu">
      <li><a class="oc-navmenu-link" href="#" aria-current="page">Contacts</a></li>
      <li><a class="oc-navmenu-link" href="#">Companies</a></li>
      <li><a class="oc-navmenu-link" href="#">Segments</a></li>
    </ul>
      @endif
  </nav>
  <div class="oc-block-appbar-actions">
      @if (isset($actions) && trim((string) $actions) !== '')
          {{ $actions }}
      @else
    <div class="oc-theme-switch" role="radiogroup" aria-label="Theme">
      <label><input type="radio" name="oc-appbar-theme" value="light"> Light</label>
      <label><input type="radio" name="oc-appbar-theme" value="dark"> Dark</label>
    </div>
    <button class="oc-btn oc-btn--ghost oc-btn--icon" type="button" popovertarget="oc-appbar-user" aria-label="User menu"><span class="oc-avatar oc-avatar--sm">SC</span></button>
    <div class="oc-dropdown-menu" id="oc-appbar-user" popover>
      <div class="oc-dropdown-label">serge@example.com</div>
      <a class="oc-dropdown-item" href="#">Profile</a>
      <a class="oc-dropdown-item" href="#">Settings</a>
      <div class="oc-dropdown-separator"></div>
      <a class="oc-dropdown-item" href="#">Log out</a>
    </div>
      @endif
  </div>
</header>
