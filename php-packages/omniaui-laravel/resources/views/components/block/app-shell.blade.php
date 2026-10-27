{{-- OmniaUI block: app-shell - Application layout: sidebar, header bar, breadcrumb strip and scrolling content. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-shell: Grid root. Height via --oc-block-shell-height (default 100dvh).
       .oc-block-shell-toggle: Hidden checkbox that collapses the sidebar (label for it in the header bar)
       .oc-sidebar: Sidebar component (first grid child)
       .oc-block-shell-main: Column holding the header bar, breadcrumbs and content
       .oc-block-shell-breadcrumbs: Strip under the header bar
       .oc-block-shell-content: Scrolling page content (the only scroll container)
       .oc-block-shell-menu-button: Shown below 48rem to open the sidebar sheet
     Slots: sidebar, header bar (see App header), breadcrumbs, content (default)
     Blade: <x-oc::block.app-shell> - attributes merge onto the root element; props: height => null.
     Blade slots (each falls back to the snippet content when empty): sidebar, header, breadcrumbs, default.
--}}
@props(['height' => null, 'sidebar' => null, 'header' => null, 'breadcrumbs' => null])
<div {{ $attributes->merge(['class' => 'oc-block-shell', 'style' => $height ? '--oc-block-shell-height: '.$height : null]) }}>
  <input class="oc-block-shell-toggle" type="checkbox" id="oc-shell-toggle" aria-label="Collapse sidebar">
  @if (isset($sidebar) && trim((string) $sidebar) !== '')
      {{ $sidebar }}
  @else
  <aside class="oc-sidebar " aria-label="Main navigation">
    <div class="oc-sidebar-header">
      <a class="oc-sidebar-menu-button oc-sidebar-menu-button--lg" href="#">
        <svg class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>
        <span class="oc-sidebar-menu-label"><strong>OmniaDesk</strong></span>
      </a>
    </div>
    <div class="oc-sidebar-content">
      <div class="oc-sidebar-group">
        <div class="oc-sidebar-group-label">Platform</div>
        <ul class="oc-sidebar-menu">
          <li><a class="oc-sidebar-menu-button" href="#" aria-current="page"><svg class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg><span class="oc-sidebar-menu-label">Dashboard</span></a></li>
          <li><a class="oc-sidebar-menu-button" href="#"><svg class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/></svg><span class="oc-sidebar-menu-label">Contacts</span><span class="oc-sidebar-menu-badge">12</span></a></li>
          <li>
            <details class="oc-sidebar-collapsible" open>
              <summary class="oc-sidebar-menu-button"><svg class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5"/></svg><span class="oc-sidebar-menu-label">Invoices</span></summary>
              <ul class="oc-sidebar-menu-sub">
                <li><a class="oc-sidebar-menu-button" href="#">Sales</a></li>
                <li><a class="oc-sidebar-menu-button" href="#">Purchases</a></li>
              </ul>
            </details>
          </li>
          <li><a class="oc-sidebar-menu-button" href="#"><svg class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg><span class="oc-sidebar-menu-label">Reports</span></a></li>
        </ul>
      </div>
      <div class="oc-sidebar-separator"></div>
      <div class="oc-sidebar-group">
        <ul class="oc-sidebar-menu">
          <li><a class="oc-sidebar-menu-button" href="#"><svg class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg><span class="oc-sidebar-menu-label">Settings</span></a></li>
        </ul>
      </div>
    </div>
    <div class="oc-sidebar-footer">
      <div class="oc-user">
        <span class="oc-avatar oc-avatar--sm">SC</span>
        <span class="oc-user-text"><span class="oc-user-name">Serge Cools</span><span class="oc-user-email">serge@example.com</span></span>
      </div>
    </div>
  </aside>
  @endif
  <div class="oc-block-shell-main">
    @if (isset($header) && trim((string) $header) !== '')
        {{ $header }}
    @else
    <header class="oc-block-appbar">
      <label class="oc-btn oc-btn--ghost oc-btn--icon" for="oc-shell-toggle" title="Toggle sidebar"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span class="oc-visually-hidden">Toggle sidebar</span></label>
      <nav class="oc-block-appbar-nav" aria-label="Module navigation">
        <ul class="oc-navmenu">
          <li><a class="oc-navmenu-link" href="#" aria-current="page">Contacts</a></li>
          <li><a class="oc-navmenu-link" href="#">Companies</a></li>
          <li><a class="oc-navmenu-link" href="#">Segments</a></li>
        </ul>
      </nav>
      <div class="oc-block-appbar-actions">
        <div class="oc-theme-switch" role="radiogroup" aria-label="Theme">
          <label><input type="radio" name="oc-shell-theme" value="light"> Light</label>
          <label><input type="radio" name="oc-shell-theme" value="dark"> Dark</label>
        </div>
        <button class="oc-btn oc-btn--ghost oc-btn--icon" type="button" popovertarget="oc-shell-user" aria-label="User menu"><span class="oc-avatar oc-avatar--sm">SC</span></button>
        <div class="oc-dropdown-menu" id="oc-shell-user" popover>
          <div class="oc-dropdown-label">serge@example.com</div>
          <a class="oc-dropdown-item" href="#">Profile</a>
          <a class="oc-dropdown-item" href="#">Settings</a>
          <div class="oc-dropdown-separator"></div>
          <a class="oc-dropdown-item" href="#">Log out</a>
        </div>
      </div>
    </header>
    @endif
    <div class="oc-block-shell-breadcrumbs">
        @if (isset($breadcrumbs) && trim((string) $breadcrumbs) !== '')
            {{ $breadcrumbs }}
        @else
        <nav aria-label="Breadcrumb"><ol class="oc-breadcrumb"><li class="oc-breadcrumb-item"><a href="#">Home</a></li><li class="oc-breadcrumb-item"><a href="#">CRM</a></li><li class="oc-breadcrumb-item" aria-current="page">Contacts</li></ol></nav>
        @endif
    </div>
    <main class="oc-block-shell-content">
        @if (! $slot->isEmpty())
            {{ $slot }}
        @else
      <h1 class="oc-heading-title">Contacts</h1>
      <p class="oc-heading-description">Page content scrolls here.</p>
        @endif
    </main>
  </div>
</div>
