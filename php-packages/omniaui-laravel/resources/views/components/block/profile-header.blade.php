{{-- OmniaUI block: profile-header - Channel / profile header: banner, overhanging avatar, name, meta, actions and a tab bar. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/profile-header.html | Map: section.oc-block-profile -> banner -> bar (avatar, info, actions) -> nav tabs
     Class API: .oc-block-profile (modifier --compact: low banner, smaller avatar), -banner (style="--oc-profile-banner: url(…)",
       default gradient from the .oc-accent--* preset), -bar, -avatar (on an .oc-avatar), -info, -name, -meta, -bio, -actions,
       -tabs (nav), -tab (link; aria-current="page" marks the active tab).
     Blade: <x-oc::block.profile-header> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): avatar, name, meta, bio, actions, default.
--}}
@props(['avatar' => null, 'name' => null, 'meta' => null, 'bio' => null, 'actions' => null])
<section {{ $attributes->merge(['class' => 'oc-block-profile oc-accent--violet', 'aria-labelledby' => 'oc-profile-name']) }}>
  <div class="oc-block-profile-banner" aria-hidden="true"></div>
  <div class="oc-block-profile-bar">
    <span class="oc-avatar oc-block-profile-avatar" aria-hidden="true">
        @if (isset($avatar) && trim((string) $avatar) !== '')
            {{ $avatar }}
        @else
        AS
        @endif
    </span>
    <div class="oc-block-profile-info">
      <h1 class="oc-block-profile-name" id="oc-profile-name">
          @if (isset($name) && trim((string) $name) !== '')
              {{ $name }}
          @else
          Acme Studio
          @endif
      </h1>
      <p class="oc-block-profile-meta">
          @if (isset($meta) && trim((string) $meta) !== '')
              {{ $meta }}
          @else
          @@acmestudio &middot; 12.4K followers &middot; 86 videos
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
  <nav class="oc-block-profile-tabs" aria-label="Profile sections">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @else
    <a class="oc-block-profile-tab" href="#home" aria-current="page">Home</a>
    <a class="oc-block-profile-tab" href="#videos">Videos</a>
    <a class="oc-block-profile-tab" href="#playlists">Playlists</a>
    <a class="oc-block-profile-tab" href="#about">About</a>
      @endif
  </nav>
</section>
