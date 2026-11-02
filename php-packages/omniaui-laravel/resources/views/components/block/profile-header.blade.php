{{-- OmniaUI block: profile-header - Channel / profile header: banner, overhanging avatar, name, meta, actions and a tab bar. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/profile-header.html | Map: section.oc-block-profile -> banner -> bar (avatar, info, actions) -> tabs (radios) -> panels
     Class API: .oc-block-profile (modifier --compact: low banner, smaller avatar), -banner (style="--oc-profile-banner: url(…)",
       default gradient from the .oc-accent--* preset), -bar, -avatar (on an .oc-avatar), -info, -name, -meta, -bio, -actions,
       -tabs, -tab: links (aria-current="page" marks the active one) or, for tabs on the page itself, labels with a
       radio; then -panels holds one -panel per tab (same order) and the checked tab shows its panel (CSS only).
       -grid / -thumb: the cards in the demo panels.
     Blade: <x-oc::block.profile-header> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): avatar, name, meta, bio, actions, tabs, default.
--}}
@props(['avatar' => null, 'name' => null, 'meta' => null, 'bio' => null, 'actions' => null, 'tabs' => null])
<section {{ $attributes->merge(['class' => 'oc-block-profile oc-accent--violet', 'aria-labelledby' => 'oc-profile-name']) }}>
  <div class="oc-block-profile-banner" aria-hidden="true"></div>
  <div class="oc-block-profile-bar">
    <span class="oc-avatar oc-block-profile-avatar" aria-hidden="true">
        @if (isset($avatar) && trim((string) $avatar) !== '')
            {{ $avatar }}
        @else
        C1
        @endif
    </span>
    <div class="oc-block-profile-info">
      <h1 class="oc-block-profile-name" id="oc-profile-name">
          @if (isset($name) && trim((string) $name) !== '')
              {{ $name }}
          @else
          Company 1
          @endif
      </h1>
      <p class="oc-block-profile-meta">
          @if (isset($meta) && trim((string) $meta) !== '')
              {{ $meta }}
          @else
          @@company1 &middot; 12.4K followers &middot; 86 videos
          @endif
      </p>
      <p class="oc-block-profile-bio">
          @if (isset($bio) && trim((string) $bio) !== '')
              {{ $bio }}
          @else
          Short tutorials about web design, CSS and building small business apps.
          @endif
      </p>
    </div>
    <div class="oc-block-profile-actions">
        @if (isset($actions) && trim((string) $actions) !== '')
            {{ $actions }}
        @else
      <button class="oc-btn" type="button">Follow</button>
      <button class="oc-btn oc-btn--outline" type="button">Share</button>
        @endif
    </div>
  </div>
  <div class="oc-block-profile-tabs" role="radiogroup" aria-label="Profile sections">
      @if (isset($tabs) && trim((string) $tabs) !== '')
          {{ $tabs }}
      @else
    <label class="oc-block-profile-tab"><input type="radio" name="oc-profile-tab" checked>Home</label>
    <label class="oc-block-profile-tab"><input type="radio" name="oc-profile-tab">Videos</label>
    <label class="oc-block-profile-tab"><input type="radio" name="oc-profile-tab">Playlists</label>
    <label class="oc-block-profile-tab"><input type="radio" name="oc-profile-tab">About</label>
      @endif
  </div>
  <div class="oc-block-profile-panels">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @else
    <div class="oc-block-profile-panel">
      <ul class="oc-block-profile-grid"><li><span class="oc-block-profile-thumb"></span><strong>Video 1</strong><small>Container queries in 8 minutes</small></li><li><span class="oc-block-profile-thumb"></span><strong>Video 2</strong><small>Colors in OKLCH</small></li><li><span class="oc-block-profile-thumb"></span><strong>Video 3</strong><small>A form without JavaScript</small></li></ul>
    </div>
    <div class="oc-block-profile-panel">
      <ul class="oc-block-profile-grid"><li><span class="oc-block-profile-thumb"></span><strong>Video 4</strong><small>Scroll snap carousel</small></li><li><span class="oc-block-profile-thumb"></span><strong>Video 5</strong><small>Anchor positioning</small></li><li><span class="oc-block-profile-thumb"></span><strong>Video 6</strong><small>Dark mode with light-dark()</small></li><li><span class="oc-block-profile-thumb"></span><strong>Video 7</strong><small>Dialogs and popovers</small></li></ul>
    </div>
    <div class="oc-block-profile-panel">
      <ul class="oc-block-profile-grid"><li><span class="oc-block-profile-thumb"></span><strong>Playlist 1</strong><small>Modern CSS · 12 videos</small></li><li><span class="oc-block-profile-thumb"></span><strong>Playlist 2</strong><small>Small business apps · 8 videos</small></li></ul>
    </div>
    <div class="oc-block-profile-panel">
      <p class="oc-block-profile-bio" style="margin:0">Company 1 makes short tutorials about web design and CSS. New videos every Tuesday. Contact: info@company1.example.</p>
    </div>
      @endif
  </div>
</section>
