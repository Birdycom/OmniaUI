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
        <span class="oc-block-sb-tile"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/></svg></span>
        <span class="oc-sidebar-menu-label"><strong>Documentation</strong><span class="oc-block-sb-sub">v1.0.0</span></span>
      </a>
    </div>
    <div class="oc-sidebar-content">
      <div class="oc-sidebar-group">
        <div class="oc-sidebar-group-label">Platform</div>
        <ul class="oc-sidebar-menu">
          <li>
            <details class="oc-sidebar-collapsible" open>
              <summary class="oc-sidebar-menu-button"><svg class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg><span class="oc-sidebar-menu-label">Dashboard</span></summary>
              <ul class="oc-sidebar-menu-sub">
                <li><a class="oc-sidebar-menu-button" href="#">Overview</a></li>
                <li><a class="oc-sidebar-menu-button" href="#">Analytics</a></li>
                <li><a class="oc-sidebar-menu-button" href="#">Reports</a></li>
              </ul>
            </details>
          </li>
          <li>
            <details class="oc-sidebar-collapsible">
              <summary class="oc-sidebar-menu-button"><svg class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg><span class="oc-sidebar-menu-label">Projects</span></summary>
              <ul class="oc-sidebar-menu-sub">
                <li><a class="oc-sidebar-menu-button" href="#">Active</a></li>
                <li><a class="oc-sidebar-menu-button" href="#">Archived</a></li>
              </ul>
            </details>
          </li>
          <li>
            <details class="oc-sidebar-collapsible">
              <summary class="oc-sidebar-menu-button"><svg class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/></svg><span class="oc-sidebar-menu-label">Team</span></summary>
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
      <span class="oc-btn oc-btn--ghost oc-btn--icon oc-btn--sm" aria-hidden="true"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg></span>
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
