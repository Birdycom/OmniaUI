{{-- OmniaUI block: module-header - Page header with icon tile, title, intro, meta badges and action row. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-modulehead: Wrapper
       .oc-block-modulehead-band: Tinted band with icon and text
       .oc-block-modulehead-icon: Icon tile
       .oc-block-modulehead-title / -intro: Title and intro
       .oc-block-modulehead-meta: Row for badges under the title (optional)
       .oc-block-modulehead-actions: Row for buttons below the band (optional)
     Slots: icon, title, intro, meta, actions
     Blade: <x-oc::block.module-header> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): icon, title, intro, meta, actions.
--}}
@props(['icon' => null, 'title' => null, 'intro' => null, 'meta' => null, 'actions' => null])
<header {{ $attributes->merge(['class' => 'oc-block-modulehead']) }}>
  <div class="oc-block-modulehead-band">
    <span class="oc-block-modulehead-icon" aria-hidden="true">
        @if (isset($icon) && trim((string) $icon) !== '')
            {{ $icon }}
        @else
        <svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/></svg>
        @endif
    </span>
    <div class="oc-block-modulehead-body">
      <h1 class="oc-block-modulehead-title">
          @if (isset($title) && trim((string) $title) !== '')
              {{ $title }}
          @else
          Contacts
          @endif
      </h1>
      <p class="oc-block-modulehead-intro">
          @if (isset($intro) && trim((string) $intro) !== '')
              {{ $intro }}
          @else
          Manage customers, suppliers and the people who work there.
          @endif
      </p>
      <div class="oc-block-modulehead-meta">
          @if (isset($meta) && trim((string) $meta) !== '')
              {{ $meta }}
          @else
          <span class="oc-badge oc-badge--info">Pro</span><span class="oc-badge oc-badge--success">Synced</span>
          @endif
      </div>
    </div>
  </div>
  <div class="oc-block-modulehead-actions">
      @if (isset($actions) && trim((string) $actions) !== '')
          {{ $actions }}
      @else
    <a class="oc-back-link" href="#">Back to CRM</a>
    <button class="oc-btn" type="button">New contact</button>
      @endif
  </div>
</header>
