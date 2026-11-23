{{-- OmniaUI block: about-timeline - About section: picture with a badge next to the company story and a year timeline. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/about-timeline.html | Map: section.oc-block-about -> inner -> media (+ badge) -> copy (eyebrow, title, text, .oc-timeline)
     Class API: .oc-block-about (modifier --reverse: picture right), -inner, -media (empty = gradient placeholder, or an <img>),
       -badge, -copy, -title. Uses the timeline component (.oc-timeline) and an .oc-accent--* preset for the placeholder.
     Blade: <x-oc::block.about-timeline> - attributes merge onto the root element. Written by hand (array props).
     Props (same names as BlockAboutTimeline in React): eyebrow, title, text, badge, image, image-alt, reverse, accent (default blue;
       :accent="false" for none), timeline-accent (timeline line in the accent color), timeline (list of ['date', 'datetime', 'title',
       'text', 'current']), title-id (default oc-about-title; also used for aria-labelledby).
       Left out (null), every text shows the snippet content; :eyebrow="false" hides the eyebrow, :badge="false" the badge.
       A text with its own <p> tags is printed as is; plain text goes in one <p>.
     Blade slots (each falls back to the snippet content when empty): badge, eyebrow, title, text, default (the <li> rows of the timeline).
--}}
@props(['badge' => null, 'eyebrow' => null, 'title' => null, 'text' => null, 'image' => null, 'imageAlt' => '', 'reverse' => false, 'accent' => 'blue', 'timelineAccent' => false, 'timeline' => null, 'titleId' => 'oc-about-title'])
@php($filled = fn ($v) => $v !== null && $v !== false && trim((string) $v) !== '')
<section {{ $attributes->merge(['class' => \Illuminate\Support\Arr::toCssClasses(['oc-block-about', 'oc-accent--'.$accent => $filled($accent), 'oc-block-about--reverse' => $reverse]), 'aria-labelledby' => $titleId]) }}>
  <div class="oc-block-about-inner">
    <figure class="oc-block-about-media"@if (! $image) aria-hidden="true"@endif>
      @if ($image)
      <img src="{{ $image }}" alt="{{ $imageAlt }}" loading="lazy">
      @endif
      @if ($badge !== false)
      <span class="oc-block-about-badge">
          @if ($filled($badge))
              {{ $badge }}
          @else
          <strong>12+</strong>years of building software
          @endif
      </span>
      @endif
    </figure>
    <div class="oc-block-about-copy">
      @if ($eyebrow !== false)
      <p class="oc-eyebrow">
          @if ($filled($eyebrow))
              {{ $eyebrow }}
          @else
          About us
          @endif
      </p>
      @endif
      <h2 class="oc-block-about-title" id="{{ $titleId }}">
          @if ($filled($title))
              {{ $title }}
          @else
          Software for everyone. Since 2012.
          @endif
      </h2>
      @if ($filled($text))
      @if (str_contains((string) $text, '<p'))
      {{ $text }}
      @else
      <p>{{ $text }}</p>
      @endif
      @elseif ($text !== false)
      <p>
          Company 1 started as an IT partner for local businesses. That practical experience is in every line of code we write today.
      </p>
      <p>You talk directly to the people who build your software. No layers in between.</p>
      @endif
      @if (! $slot->isEmpty())
      <ol @class(['oc-timeline', 'oc-timeline--accent' => $timelineAccent])>
              {{ $slot }}
      </ol>
      @elseif (is_array($timeline))
      @if (count($timeline))
      <x-oc::timeline :accent="(bool) $timelineAccent" :items="array_map(fn ($row) => isset($row['dateTime']) && ! isset($row['datetime']) ? $row + ['datetime' => $row['dateTime']] : $row, $timeline)" />
      @endif
      @else
      <ol @class(['oc-timeline', 'oc-timeline--accent' => $timelineAccent])>
        <li class="oc-timeline__item"><span class="oc-timeline__date">2012</span><p class="oc-timeline__text">Company 1 is founded by two developers.</p></li>
        <li class="oc-timeline__item"><span class="oc-timeline__date">2019</span><p class="oc-timeline__text">New office and a first own product.</p></li>
        <li class="oc-timeline__item oc-timeline__item--current"><span class="oc-timeline__date">Today</span><p class="oc-timeline__text">Own products and custom work, from web apps to desktop tools.</p></li>
      </ol>
      @endif
    </div>
  </div>
</section>
