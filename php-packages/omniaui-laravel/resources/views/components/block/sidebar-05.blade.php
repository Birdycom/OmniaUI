{{-- OmniaUI block: sidebar-05 - Menu items that expand a submenu with details and summary. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-sb: Frame: grid of sidebar + main. Height via --oc-block-sb-height. Modifiers: --right, --both, --double, --floating, --inset
       .oc-block-sb-main / -bar / -body: Main column, top bar (modifier --sticky) and placeholder body (modifier --scroll)
       .oc-block-sb-ph: Content placeholder block (replace with real content)
       .oc-block-sb-toggle: Hidden checkbox: its label collapses the sidebar to icons (CSS only, :has())
       .oc-block-sb-group: details element that makes a sidebar group label collapsible
       .oc-block-sb-rail: Narrow icon rail for the double sidebar
       .oc-block-sb-tile / -sub: Square brand tile and small secondary line inside a menu button
       .oc-sidebar: The sidebar component (modifiers --collapsed, --right, --floating); see Sidebar
     Blade: <x-oc::block.sidebar-05> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): default.
--}}
<div {{ $attributes->merge(['class' => 'oc-block-sb']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <aside class="oc-sidebar" aria-label="Main navigation">
    <div class="oc-sidebar-header">
      <a class="oc-sidebar-menu-button oc-sidebar-menu-button--lg" href="#">
        <span class="oc-block-sb-tile"><svg data-icon="mdi:layers-outline" class="" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 18.54l7.37-5.74L21 14.07l-9 7l-9-7l1.62-1.26zM12 16L3 9l9-7l9 7zm0-11.47L6.26 9L12 13.47L17.74 9z"/></svg></span>
        <span class="oc-sidebar-menu-label"><strong>Documentation</strong><span class="oc-block-sb-sub">v1.0.0</span></span>
      </a>
    </div>
    <div class="oc-sidebar-content">
      <div class="oc-sidebar-group">
        <div class="oc-sidebar-group-label">Platform</div>
        <ul class="oc-sidebar-menu">
          <li>
            <details class="oc-sidebar-collapsible" open>
              <summary class="oc-sidebar-menu-button"><svg data-icon="mdi:home-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81zM12 3L2 12h3v8h6v-6h2v6h6v-8h3"/></svg><span class="oc-sidebar-menu-label">Dashboard</span></summary>
              <ul class="oc-sidebar-menu-sub">
                <li><a class="oc-sidebar-menu-button" href="#">Overview</a></li>
                <li><a class="oc-sidebar-menu-button" href="#">Analytics</a></li>
                <li><a class="oc-sidebar-menu-button" href="#">Reports</a></li>
              </ul>
            </details>
          </li>
          <li>
            <details class="oc-sidebar-collapsible">
              <summary class="oc-sidebar-menu-button"><svg data-icon="mdi:folder-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 18H4V8h16m0-2h-8l-2-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2"/></svg><span class="oc-sidebar-menu-label">Projects</span></summary>
              <ul class="oc-sidebar-menu-sub">
                <li><a class="oc-sidebar-menu-button" href="#">Active</a></li>
                <li><a class="oc-sidebar-menu-button" href="#">Archived</a></li>
              </ul>
            </details>
          </li>
          <li>
            <details class="oc-sidebar-collapsible">
              <summary class="oc-sidebar-menu-button"><svg data-icon="mdi:account-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1"/></svg><span class="oc-sidebar-menu-label">Team</span></summary>
              <ul class="oc-sidebar-menu-sub">
                <li><a class="oc-sidebar-menu-button" href="#">Members</a></li>
                <li><a class="oc-sidebar-menu-button" href="#">Roles</a></li>
                <li><a class="oc-sidebar-menu-button" href="#">Invitations</a></li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  </aside>
  <div class="oc-block-sb-main">
    <header class="oc-block-sb-bar">
      <span class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" aria-hidden="true"><svg data-icon="mdi:dock-left" class="" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 14H9V6h11Z"/></svg></span>
      <span class="oc-block-sb-sep"></span>
      <nav aria-label="Breadcrumb"><ol class="oc-breadcrumb"><li class="oc-breadcrumb-item"><a href="#">Building</a></li><li class="oc-breadcrumb-item" aria-current="page">Overview</li></ol></nav>
    </header>
    <div class="oc-block-sb-body">
      <div class="oc-block-sb-ph"></div><div class="oc-block-sb-ph"></div><div class="oc-block-sb-ph"></div>
      <div class="oc-block-sb-ph oc-block-sb-ph--wide"></div>
    </div>
  </div>
    @endif
</div>
