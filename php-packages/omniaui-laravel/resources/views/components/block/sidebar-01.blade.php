{{-- OmniaUI block: sidebar-01 - The base layout: brand header, two labelled groups and a user footer. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-sb: Frame: grid of sidebar + main. Height via --oc-block-sb-height. Modifiers: --right, --both, --double, --floating, --inset
       .oc-block-sb-main / -bar / -body: Main column, top bar (modifier --sticky) and placeholder body (modifier --scroll)
       .oc-block-sb-ph: Content placeholder block (replace with real content)
       .oc-block-sb-toggle: Hidden checkbox: its label collapses the sidebar to icons (CSS only, :has())
       .oc-block-sb-group: details element that makes a sidebar group label collapsible
       .oc-block-sb-rail: Narrow icon rail for the double sidebar
       .oc-block-sb-tile / -sub: Square brand tile and small secondary line inside a menu button
       .oc-sidebar: The sidebar component (modifiers --collapsed, --right, --floating); see Sidebar
     Blade: <x-oc::block.sidebar-01> - attributes merge onto the root element.
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
          <li><a class="oc-sidebar-menu-button" href="#" aria-current="page"><svg data-icon="mdi:book-open-variant-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21.5c-1.35-.85-3.8-1.5-5.5-1.5c-1.65 0-3.35.3-4.75 1.05c-.1.05-.15.05-.25.05c-.25 0-.5-.25-.5-.5V6c.6-.45 1.25-.75 2-1c1.11-.35 2.33-.5 3.5-.5c1.95 0 4.05.4 5.5 1.5c1.45-1.1 3.55-1.5 5.5-1.5c1.17 0 2.39.15 3.5.5c.75.25 1.4.55 2 1v14.6c0 .25-.25.5-.5.5c-.1 0-.15 0-.25-.05c-1.4-.75-3.1-1.05-4.75-1.05c-1.7 0-4.15.65-5.5 1.5m-1-14c-1.36-.6-3.16-1-4.5-1c-1.2 0-2.4.15-3.5.5v11.5c1.1-.35 2.3-.5 3.5-.5c1.34 0 3.14.4 4.5 1zM13 19c1.36-.6 3.16-1 4.5-1c1.2 0 2.4.15 3.5.5V7c-1.1-.35-2.3-.5-3.5-.5c-1.34 0-3.14.4-4.5 1zm1-2.65c.96-.35 2.12-.52 3.5-.52c1.04 0 1.88.08 2.5.24v-1.5a13.9 13.9 0 0 0-6 .19zm0-2.66c.96-.35 2.12-.53 3.5-.53c1.04 0 1.88.08 2.5.24v-1.5c-.87-.16-1.71-.23-2.5-.23c-1.28 0-2.45.15-3.5.45zM14 11c.96-.33 2.12-.5 3.5-.5c.91 0 1.76.09 2.5.28V9.23c-.87-.15-1.71-.23-2.5-.23c-1.32 0-2.5.15-3.5.46z"/></svg><span class="oc-sidebar-menu-label">Introduction</span></a></li>
          <li><a class="oc-sidebar-menu-button" href="#"><svg data-icon="mdi:code-tags" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.6 16.6l4.6-4.6l-4.6-4.6L16 6l6 6l-6 6zm-5.2 0L4.8 12l4.6-4.6L8 6l-6 6l6 6z"/></svg><span class="oc-sidebar-menu-label">Installation</span></a></li>
          <li><a class="oc-sidebar-menu-button" href="#"><svg data-icon="mdi:cog-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 8a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m-2 12c-.25 0-.46-.18-.5-.42l-.37-2.65c-.63-.25-1.17-.59-1.69-.99l-2.49 1.01c-.22.08-.49 0-.61-.22l-2-3.46a.493.493 0 0 1 .12-.64l2.11-1.66L4.5 12l.07-1l-2.11-1.63a.493.493 0 0 1-.12-.64l2-3.46c.12-.22.39-.31.61-.22l2.49 1c.52-.39 1.06-.73 1.69-.98l.37-2.65c.04-.24.25-.42.5-.42h4c.25 0 .46.18.5.42l.37 2.65c.63.25 1.17.59 1.69.98l2.49-1c.22-.09.49 0 .61.22l2 3.46c.13.22.07.49-.12.64L19.43 11l.07 1l-.07 1l2.11 1.63c.19.15.25.42.12.64l-2 3.46c-.12.22-.39.31-.61.22l-2.49-1c-.52.39-1.06.73-1.69.98l-.37 2.65c-.04.24-.25.42-.5.42zm1.25-18l-.37 2.61c-1.2.25-2.26.89-3.03 1.78L5.44 7.35l-.75 1.3L6.8 10.2a5.55 5.55 0 0 0 0 3.6l-2.12 1.56l.75 1.3l2.43-1.04c.77.88 1.82 1.52 3.01 1.76l.37 2.62h1.52l.37-2.61c1.19-.25 2.24-.89 3.01-1.77l2.43 1.04l.75-1.3l-2.12-1.55c.4-1.17.4-2.44 0-3.61l2.11-1.55l-.75-1.3l-2.41 1.04a5.42 5.42 0 0 0-3.03-1.77L12.75 4z"/></svg><span class="oc-sidebar-menu-label">Configuration</span></a></li>
        </ul>
      </div>
      <div class="oc-sidebar-group">
        <div class="oc-sidebar-group-label">Building</div>
        <ul class="oc-sidebar-menu">
          <li><a class="oc-sidebar-menu-button" href="#"><svg data-icon="mdi:layers-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 18.54l7.37-5.74L21 14.07l-9 7l-9-7l1.62-1.26zM12 16L3 9l9-7l9 7zm0-11.47L6.26 9L12 13.47L17.74 9z"/></svg><span class="oc-sidebar-menu-label">Components</span><span class="oc-sidebar-menu-badge">24</span></a></li>
          <li><a class="oc-sidebar-menu-button" href="#"><svg data-icon="mdi:file-document-outline" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 2h7v5h5v11H6zm2 8v2h8v-2zm0 4v2h5v-2z"/></svg><span class="oc-sidebar-menu-label">Blocks</span></a></li>
          <li><a class="oc-sidebar-menu-button" href="#"><svg data-icon="mdi:chart-bar" class="oc-sidebar-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 21H2V3h2v16h2v-9h4v9h2V6h4v13h2v-5h4z"/></svg><span class="oc-sidebar-menu-label">Charts</span></a></li>
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
