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
        <svg data-icon="mdi:home-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81zM12 3L2 12h3v8h6v-6h2v6h6v-8h3"/></svg>
        <span class="oc-sidebar-menu-label"><strong>OmniaDesk</strong></span>
      </a>
    </div>
    <div class="oc-sidebar-content">
      <div class="oc-sidebar-group">
        <div class="oc-sidebar-group-label">Platform</div>
        <ul class="oc-sidebar-menu">
          <li><a class="oc-sidebar-menu-button" href="#" aria-current="page"><svg data-icon="mdi:home-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81zM12 3L2 12h3v8h6v-6h2v6h6v-8h3"/></svg><span class="oc-sidebar-menu-label">Dashboard</span></a></li>
          <li><a class="oc-sidebar-menu-button" href="#"><svg data-icon="mdi:account-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1"/></svg><span class="oc-sidebar-menu-label">Contacts</span><span class="oc-sidebar-menu-badge">12</span></a></li>
          <li>
            <details class="oc-sidebar-collapsible" open>
              <summary class="oc-sidebar-menu-button"><svg data-icon="mdi:file-document-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 2h7v5h5v11H6zm2 8v2h8v-2zm0 4v2h5v-2z"/></svg><span class="oc-sidebar-menu-label">Invoices</span></summary>
              <ul class="oc-sidebar-menu-sub">
                <li><a class="oc-sidebar-menu-button" href="#">Sales</a></li>
                <li><a class="oc-sidebar-menu-button" href="#">Purchases</a></li>
              </ul>
            </details>
          </li>
          <li><a class="oc-sidebar-menu-button" href="#"><svg data-icon="mdi:chart-bar" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 21H2V3h2v16h2v-9h4v9h2V6h4v13h2v-5h4z"/></svg><span class="oc-sidebar-menu-label">Reports</span></a></li>
        </ul>
      </div>
      <div class="oc-sidebar-separator"></div>
      <div class="oc-sidebar-group">
        <ul class="oc-sidebar-menu">
          <li><a class="oc-sidebar-menu-button" href="#"><svg data-icon="mdi:cog-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 8a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m-2 12c-.25 0-.46-.18-.5-.42l-.37-2.65c-.63-.25-1.17-.59-1.69-.99l-2.49 1.01c-.22.08-.49 0-.61-.22l-2-3.46a.493.493 0 0 1 .12-.64l2.11-1.66L4.5 12l.07-1l-2.11-1.63a.493.493 0 0 1-.12-.64l2-3.46c.12-.22.39-.31.61-.22l2.49 1c.52-.39 1.06-.73 1.69-.98l.37-2.65c.04-.24.25-.42.5-.42h4c.25 0 .46.18.5.42l.37 2.65c.63.25 1.17.59 1.69.98l2.49-1c.22-.09.49 0 .61.22l2 3.46c.13.22.07.49-.12.64L19.43 11l.07 1l-.07 1l2.11 1.63c.19.15.25.42.12.64l-2 3.46c-.12.22-.39.31-.61.22l-2.49-1c-.52.39-1.06.73-1.69.98l-.37 2.65c-.04.24-.25.42-.5.42zm1.25-18l-.37 2.61c-1.2.25-2.26.89-3.03 1.78L5.44 7.35l-.75 1.3L6.8 10.2a5.55 5.55 0 0 0 0 3.6l-2.12 1.56l.75 1.3l2.43-1.04c.77.88 1.82 1.52 3.01 1.76l.37 2.62h1.52l.37-2.61c1.19-.25 2.24-.89 3.01-1.77l2.43 1.04l.75-1.3l-2.12-1.55c.4-1.17.4-2.44 0-3.61l2.11-1.55l-.75-1.3l-2.41 1.04a5.42 5.42 0 0 0-3.03-1.77L12.75 4z"/></svg><span class="oc-sidebar-menu-label">Settings</span></a></li>
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
      <label class="oc-btn oc-btn--ghost oc-btn--icon" for="oc-shell-toggle" title="Toggle sidebar"><svg data-icon="mdi:menu" class="" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg><span class="oc-visually-hidden">Toggle sidebar</span></label>
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
