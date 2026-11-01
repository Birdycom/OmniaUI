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
        <svg data-icon="mdi:account-outline" class="" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1"/></svg>
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
