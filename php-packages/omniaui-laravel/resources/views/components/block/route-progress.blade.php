{{-- OmniaUI block: route-progress - What a visitor or team sees on a route or course: progress, the next step with its distance and every step with its state (done, current, to do, locked). Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/route-progress.html | Map: head (title, meta, score) -> progress bar -> next-step button -> ol of steps (marker, name, sub, value)
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-route-progress: Frame (container query: next-step distance under the text below 24rem)
       .oc-block-route-progress-head / -title / -meta / -score (b + span): Heading, one line and the score
       .oc-block-route-progress-bar: Label row (-bar-label) and the free .oc-progress component
       .oc-block-route-progress-next: Button with -next-icon, -next-text (-next-label, -next-title, -next-sub) and -next-meta. Tones: --finish (success), --over (time is up)
       .oc-block-route-progress-list: ol of steps on one route line
       .oc-block-route-progress-item: One step. States: --done, --wrong (with --done: done without points), --current, --locked
       .oc-block-route-progress-link: Button with -marker (number or icon), -text (-name, -sub) and -value (distance or points)
     No JavaScript: your app sets the states, the numbers and what a click opens.
     Blade: <x-oc::block.route-progress> - attributes merge onto the root element. Written by hand (0.17.0), prop names as in the React block.
     Props (a prop left out shows the snippet content): title, meta (false: no meta line), score (false: no score), score-label ('points'),
       done + total (bar, label and aria), progress-label (default "3 of 6 steps done"), next (array: label, title, sub, meta, icon,
       tone default|finish|over, attributes; false: no next-step button), steps (array of rows: name, sub, value, marker (number or
       webicon name), markerLabel, state todo|done|wrong|current|locked, attributes), list-label ('Steps'), title-id ('oc-rprogress-title').
       `attributes` are extra attributes on that button (wire:click, data-*).
     Blade slots (they win over the props; each falls back to the snippet content when empty): title, meta, next, default (the li rows).
--}}
@props([
    'title' => null, 'meta' => null, 'next' => null, 'score' => null, 'scoreLabel' => 'points', 'done' => null, 'total' => null,
    'progressLabel' => null, 'steps' => null, 'listLabel' => 'Steps', 'titleId' => 'oc-rprogress-title',
])
@php
    $hasBar = $done !== null && $total !== null;
    $pct = $hasBar && (int) $total > 0 ? (int) round(min((int) $done, (int) $total) / (int) $total * 100) : 0;
    $isIcon = fn ($m) => is_string($m) && str_contains($m, ':');
    $bag = fn ($a) => new \Illuminate\View\ComponentAttributeBag(is_array($a) ? $a : []);
@endphp
<section {{ $attributes->merge(['class' => 'oc-block-route-progress', 'aria-labelledby' => $titleId]) }}>
  <div class="oc-block-route-progress-head">
    <div>
      <h2 class="oc-block-route-progress-title" id="{{ $titleId }}">
          @if (isset($title) && trim((string) $title) !== '')
              {{ $title }}
          @else
          Route 1
          @endif
      </h2>
      @if ($meta !== false)
      <p class="oc-block-route-progress-meta">
          @if (isset($meta) && trim((string) $meta) !== '')
              {{ $meta }}
          @else
          Team 1 · started at 10:05
          @endif
      </p>
      @endif
    </div>
    @if ($score === false)
    @elseif ($score !== null)
    <div class="oc-block-route-progress-score"><b>{{ $score }}</b><span>{{ $scoreLabel }}</span></div>
    @else
    <div class="oc-block-route-progress-score"><b>40</b><span>points</span></div>
    @endif
  </div>
  <div class="oc-block-route-progress-bar">
    @if ($hasBar)
    <div class="oc-block-route-progress-bar-label"><span>{{ $progressLabel ?? $done.' of '.$total.' steps done' }}</span><span>{{ $pct }}%</span></div>
    <div class="oc-progress" role="progressbar" aria-label="Steps done" aria-valuenow="{{ $done }}" aria-valuemin="0" aria-valuemax="{{ $total }}"><div class="oc-progress-bar" style="width: {{ $pct }}%"></div></div>
    @else
    <div class="oc-block-route-progress-bar-label"><span>3 of 6 steps done</span><span>50%</span></div>
    <div class="oc-progress" role="progressbar" aria-label="Steps done" aria-valuenow="3" aria-valuemin="0" aria-valuemax="6"><div class="oc-progress-bar" style="width: 50%"></div></div>
    @endif
  </div>
  @if ($next === false)
  @elseif (is_array($next))
  <button {{ $bag($next['attributes'] ?? [])->class(['oc-block-route-progress-next', 'oc-block-route-progress-next--'.($next['tone'] ?? 'default') => ($next['tone'] ?? 'default') !== 'default'])->merge(['type' => 'button']) }}>
    <span class="oc-block-route-progress-next-icon" aria-hidden="true"><x-oc::webicon :name="$next['icon'] ?? 'mdi:walk'" bare fallback="iconify" /></span>
    <span class="oc-block-route-progress-next-text">
      <span class="oc-block-route-progress-next-label">{{ $next['label'] ?? 'Now' }}</span>
      <span class="oc-block-route-progress-next-title">{{ $next['title'] ?? '' }}</span>
      @isset($next['sub'])<span class="oc-block-route-progress-next-sub">{{ $next['sub'] }}</span>@endisset
    </span>
    @isset($next['meta'])<span class="oc-block-route-progress-next-meta">{{ $next['meta'] }}</span>@endisset
  </button>
  @elseif (isset($next) && trim((string) $next) !== '')
      {{ $next }}
  @else
  <button class="oc-block-route-progress-next" type="button">
    <span class="oc-block-route-progress-next-icon" aria-hidden="true"><x-oc::webicon name="mdi:walk" bare fallback="iconify" /></span>
    <span class="oc-block-route-progress-next-text">
      <span class="oc-block-route-progress-next-label">Now</span>
      <span class="oc-block-route-progress-next-title">Walk to step 3 · Town hall</span>
      <span class="oc-block-route-progress-next-sub">Market street 1</span>
    </span>
    <span class="oc-block-route-progress-next-meta">240 m</span>
  </button>
  @endif
  <ol class="oc-block-route-progress-list" aria-label="{{ $listLabel }}">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @elseif (is_array($steps))
          @foreach ($steps as $s)
              @php
                  $st = $s['state'] ?? 'todo';
                  $marker = $s['marker'] ?? $loop->iteration;
                  $markerLabel = $s['markerLabel'] ?? $s['marker-label'] ?? null;
              @endphp
    <li @class([
        'oc-block-route-progress-item',
        'oc-block-route-progress-item--done' => $st === 'done' || $st === 'wrong',
        'oc-block-route-progress-item--wrong' => $st === 'wrong',
        'oc-block-route-progress-item--current' => $st === 'current',
        'oc-block-route-progress-item--locked' => $st === 'locked',
    ])>
      <button {{ $bag($s['attributes'] ?? [])->merge(['class' => 'oc-block-route-progress-link', 'type' => 'button', 'aria-current' => $st === 'current' ? 'step' : null]) }}><span class="oc-block-route-progress-marker">@if ($isIcon($marker))<x-oc::webicon :name="$marker" :label="$markerLabel" bare fallback="iconify" />@else{{ $marker }}@endif</span><span class="oc-block-route-progress-text"><span class="oc-block-route-progress-name">{{ $s['name'] ?? '' }}</span>@isset($s['sub'])<span class="oc-block-route-progress-sub">{{ $s['sub'] }}</span>@endisset</span>@isset($s['value'])<span class="oc-block-route-progress-value">{{ $s['value'] }}</span>@endisset</button>
    </li>
          @endforeach
      @else
    <li class="oc-block-route-progress-item oc-block-route-progress-item--done">
      <button class="oc-block-route-progress-link" type="button"><span class="oc-block-route-progress-marker">1</span><span class="oc-block-route-progress-text"><span class="oc-block-route-progress-name">Old gate</span><span class="oc-block-route-progress-sub">Right answer</span></span><span class="oc-block-route-progress-value">+20</span></button>
    </li>
    <li class="oc-block-route-progress-item oc-block-route-progress-item--done oc-block-route-progress-item--wrong">
      <button class="oc-block-route-progress-link" type="button"><span class="oc-block-route-progress-marker">2</span><span class="oc-block-route-progress-text"><span class="oc-block-route-progress-name">Market square</span><span class="oc-block-route-progress-sub">Wrong answer</span></span><span class="oc-block-route-progress-value">0</span></button>
    </li>
    <li class="oc-block-route-progress-item oc-block-route-progress-item--done">
      <button class="oc-block-route-progress-link" type="button"><span class="oc-block-route-progress-marker"><x-oc::webicon name="mdi:camera-outline" label="Photo task" bare fallback="iconify" /></span><span class="oc-block-route-progress-text"><span class="oc-block-route-progress-name">Team photo</span><span class="oc-block-route-progress-sub">Photo sent</span></span><span class="oc-block-route-progress-value">+20</span></button>
    </li>
    <li class="oc-block-route-progress-item oc-block-route-progress-item--current">
      <button class="oc-block-route-progress-link" type="button" aria-current="step"><span class="oc-block-route-progress-marker">3</span><span class="oc-block-route-progress-text"><span class="oc-block-route-progress-name">Town hall</span><span class="oc-block-route-progress-sub">Market street 1</span></span><span class="oc-block-route-progress-value">240 m</span></button>
    </li>
    <li class="oc-block-route-progress-item">
      <button class="oc-block-route-progress-link" type="button"><span class="oc-block-route-progress-marker">4</span><span class="oc-block-route-progress-text"><span class="oc-block-route-progress-name">River bridge</span><span class="oc-block-route-progress-sub">Quay 1</span></span><span class="oc-block-route-progress-value">680 m</span></button>
    </li>
    <li class="oc-block-route-progress-item oc-block-route-progress-item--locked">
      <button class="oc-block-route-progress-link" type="button"><span class="oc-block-route-progress-marker"><x-oc::webicon name="mdi:flag-checkered" label="Finish" bare fallback="iconify" /></span><span class="oc-block-route-progress-text"><span class="oc-block-route-progress-name">Finish</span><span class="oc-block-route-progress-sub">Opens after 4 steps</span></span><span class="oc-block-route-progress-value">1.1 km</span></button>
    </li>
      @endif
  </ol>
</section>
