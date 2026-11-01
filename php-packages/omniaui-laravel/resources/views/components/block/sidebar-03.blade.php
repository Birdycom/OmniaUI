{{-- OmniaUI block: sidebar-03 - Menu items with nested lists that stay visible, guided by a vertical line. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-sb: Frame: grid of sidebar + main. Height via --oc-block-sb-height. Modifiers: --right, --both, --double, --floating, --inset
       .oc-block-sb-main / -bar / -body: Main column, top bar (modifier --sticky) and placeholder body (modifier --scroll)
       .oc-block-sb-ph: Content placeholder block (replace with real content)
       .oc-block-sb-toggle: Hidden checkbox: its label collapses the sidebar to icons (CSS only, :has())
       .oc-block-sb-group: details element that makes a sidebar group label collapsible
       .oc-block-sb-rail: Narrow icon rail for the double sidebar
       .oc-block-sb-tile / -sub: Square brand tile and small secondary line inside a menu button
       .oc-sidebar: The sidebar component (modifiers --collapsed, --right, --floating); see Sidebar
     Blade: <x-oc::block.sidebar-03> - attributes merge onto the root element.
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
        <div class="oc-sidebar-group-label">Getting started</div>
        <ul class="oc-sidebar-menu">
          <li><a class="oc-sidebar-menu-button" href="#" aria-current="page"><svg data-icon="mdi:book-open-variant-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.5c-1.35-.85-3.8-1.5-5.5-1.5c-1.65 0-3.35.3-4.75 1.05c-.1.05-.15.05-.25.05c-.25 0-.5-.25-.5-.5V6c.6-.45 1.25-.75 2-1c1.11-.35 2.33-.5 3.5-.5c1.95 0 4.05.4 5.5 1.5c1.45-1.1 3.55-1.5 5.5-1.5c1.17 0 2.39.15 3.5.5c.75.25 1.4.55 2 1v14.6c0 .25-.25.5-.5.5c-.1 0-.15 0-.25-.05c-1.4-.75-3.1-1.05-4.75-1.05c-1.7 0-4.15.65-5.5 1.5m-1-14c-1.36-.6-3.16-1-4.5-1c-1.2 0-2.4.15-3.5.5v11.5c1.1-.35 2.3-.5 3.5-.5c1.34 0 3.14.4 4.5 1zM13 19c1.36-.6 3.16-1 4.5-1c1.2 0 2.4.15 3.5.5V7c-1.1-.35-2.3-.5-3.5-.5c-1.34 0-3.14.4-4.5 1zm1-2.65c.96-.35 2.12-.52 3.5-.52c1.04 0 1.88.08 2.5.24v-1.5a13.9 13.9 0 0 0-6 .19zm0-2.66c.96-.35 2.12-.53 3.5-.53c1.04 0 1.88.08 2.5.24v-1.5c-.87-.16-1.71-.23-2.5-.23c-1.28 0-2.45.15-3.5.45zM14 11c.96-.33 2.12-.5 3.5-.5c.91 0 1.76.09 2.5.28V9.23c-.87-.15-1.71-.23-2.5-.23c-1.32 0-2.5.15-3.5.46z"/></svg><span class="oc-sidebar-menu-label">Introduction</span></a>
            <ul class="oc-sidebar-menu-sub">
              <li><a class="oc-sidebar-menu-button" href="#">Overview</a></li>
              <li><a class="oc-sidebar-menu-button" href="#">Quick start</a></li>
              <li><a class="oc-sidebar-menu-button" href="#">Tokens</a></li>
            </ul>
          </li>
          <li><a class="oc-sidebar-menu-button" href="#"><svg data-icon="mdi:layers-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 18.54l7.37-5.74L21 14.07l-9 7l-9-7l1.62-1.26zM12 16L3 9l9-7l9 7zm0-11.47L6.26 9L12 13.47L17.74 9z"/></svg><span class="oc-sidebar-menu-label">Components</span></a>
            <ul class="oc-sidebar-menu-sub">
              <li><a class="oc-sidebar-menu-button" href="#">Buttons</a></li>
              <li><a class="oc-sidebar-menu-button" href="#">Forms</a></li>
              <li><a class="oc-sidebar-menu-button" href="#">Navigation</a></li>
            </ul>
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
