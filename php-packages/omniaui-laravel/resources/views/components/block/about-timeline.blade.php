{{-- OmniaUI block: about-timeline - About section: picture with a badge next to the company story and a year timeline. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/about-timeline.html | Map: section.oc-block-about -> inner -> media (+ badge) -> copy (eyebrow, title, text, .oc-timeline)
     Class API: .oc-block-about (modifier --reverse: picture right), -inner, -media (empty = gradient placeholder, or an <img>),
       -badge, -copy, -title. Uses the timeline component (.oc-timeline) and an .oc-accent--* preset for the placeholder.
     Blade: <x-oc::block.about-timeline> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): badge, eyebrow, title, text, default.
--}}
@props(['badge' => null, 'eyebrow' => null, 'title' => null, 'text' => null])
<section {{ $attributes->merge(['class' => 'oc-block-about oc-accent--blue', 'aria-labelledby' => 'oc-about-title']) }}>
  <div class="oc-block-about-inner">
    <figure class="oc-block-about-media" aria-hidden="true">
      <span class="oc-block-about-badge">
          @if (isset($badge) && trim((string) $badge) !== '')
              {{ $badge }}
          @else
          <strong>12+</strong>years of building software
          @endif
      </span>
    </figure>
    <div class="oc-block-about-copy">
      <p class="oc-eyebrow">
          @if (isset($eyebrow) && trim((string) $eyebrow) !== '')
              {{ $eyebrow }}
          @else
          About us
          @endif
      </p>
      <h2 class="oc-block-about-title" id="oc-about-title">
          @if (isset($title) && trim((string) $title) !== '')
              {{ $title }}
          @else
          Software for everyone. <span class="oc-text-gradient">Since 2012.</span>
          @endif
      </h2>
      <p>
          @if (isset($text) && trim((string) $text) !== '')
              {{ $text }}
          @else
          Acme started as an IT partner for local businesses. That practical experience is in every line of code we write today.
          @endif
      </p>
      <p>You talk directly to the people who build your software. No layers in between.</p>
      <ol class="oc-timeline">
          @if (! $slot->isEmpty())
              {{ $slot }}
          @else
        <li class="oc-timeline__item"><span class="oc-timeline__date">2012</span><p class="oc-timeline__text">Acme is founded by two developers.</p></li>
        <li class="oc-timeline__item"><span class="oc-timeline__date">2019</span><p class="oc-timeline__text">New office and a first own product.</p></li>
        <li class="oc-timeline__item oc-timeline__item--current"><span class="oc-timeline__date">Today</span><p class="oc-timeline__text">Own products and custom work, from web apps to desktop tools.</p></li>
          @endif
      </ol>
    </div>
  </div>
</section>
