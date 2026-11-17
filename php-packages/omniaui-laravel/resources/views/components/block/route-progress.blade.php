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
     Blade: <x-oc::block.route-progress> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): title, meta, next, default.
--}}
@props(['title' => null, 'meta' => null, 'next' => null])
<section {{ $attributes->merge(['class' => 'oc-block-route-progress', 'aria-labelledby' => 'oc-rprogress-title']) }}>
  <div class="oc-block-route-progress-head">
    <div>
      <h2 class="oc-block-route-progress-title" id="oc-rprogress-title">
          @if (isset($title) && trim((string) $title) !== '')
              {{ $title }}
          @else
          Route 1
          @endif
      </h2>
      <p class="oc-block-route-progress-meta">
          @if (isset($meta) && trim((string) $meta) !== '')
              {{ $meta }}
          @else
          Team 1 · started at 10:05
          @endif
      </p>
    </div>
    <div class="oc-block-route-progress-score"><b>40</b><span>points</span></div>
  </div>
  <div class="oc-block-route-progress-bar">
    <div class="oc-block-route-progress-bar-label"><span>3 of 6 steps done</span><span>50%</span></div>
    <div class="oc-progress" role="progressbar" aria-label="Steps done" aria-valuenow="3" aria-valuemin="0" aria-valuemax="6"><div class="oc-progress-bar" style="width: 50%"></div></div>
  </div>
  @if (isset($next) && trim((string) $next) !== '')
      {{ $next }}
  @else
  <button class="oc-block-route-progress-next" type="button">
    <span class="oc-block-route-progress-next-icon" aria-hidden="true"><iconify-icon icon="mdi:walk"></iconify-icon></span>
    <span class="oc-block-route-progress-next-text">
      <span class="oc-block-route-progress-next-label">Now</span>
      <span class="oc-block-route-progress-next-title">Walk to step 3 · Town hall</span>
      <span class="oc-block-route-progress-next-sub">Market street 1</span>
    </span>
    <span class="oc-block-route-progress-next-meta">240 m</span>
  </button>
  @endif
  <ol class="oc-block-route-progress-list" aria-label="Steps">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @else
    <li class="oc-block-route-progress-item oc-block-route-progress-item--done">
      <button class="oc-block-route-progress-link" type="button"><span class="oc-block-route-progress-marker">1</span><span class="oc-block-route-progress-text"><span class="oc-block-route-progress-name">Old gate</span><span class="oc-block-route-progress-sub">Right answer</span></span><span class="oc-block-route-progress-value">+20</span></button>
    </li>
    <li class="oc-block-route-progress-item oc-block-route-progress-item--done oc-block-route-progress-item--wrong">
      <button class="oc-block-route-progress-link" type="button"><span class="oc-block-route-progress-marker">2</span><span class="oc-block-route-progress-text"><span class="oc-block-route-progress-name">Market square</span><span class="oc-block-route-progress-sub">Wrong answer</span></span><span class="oc-block-route-progress-value">0</span></button>
    </li>
    <li class="oc-block-route-progress-item oc-block-route-progress-item--done">
      <button class="oc-block-route-progress-link" type="button"><span class="oc-block-route-progress-marker"><iconify-icon icon="mdi:camera-outline" aria-label="Photo task"></iconify-icon></span><span class="oc-block-route-progress-text"><span class="oc-block-route-progress-name">Team photo</span><span class="oc-block-route-progress-sub">Photo sent</span></span><span class="oc-block-route-progress-value">+20</span></button>
    </li>
    <li class="oc-block-route-progress-item oc-block-route-progress-item--current">
      <button class="oc-block-route-progress-link" type="button" aria-current="step"><span class="oc-block-route-progress-marker">3</span><span class="oc-block-route-progress-text"><span class="oc-block-route-progress-name">Town hall</span><span class="oc-block-route-progress-sub">Market street 1</span></span><span class="oc-block-route-progress-value">240 m</span></button>
    </li>
    <li class="oc-block-route-progress-item">
      <button class="oc-block-route-progress-link" type="button"><span class="oc-block-route-progress-marker">4</span><span class="oc-block-route-progress-text"><span class="oc-block-route-progress-name">River bridge</span><span class="oc-block-route-progress-sub">Quay 1</span></span><span class="oc-block-route-progress-value">680 m</span></button>
    </li>
    <li class="oc-block-route-progress-item oc-block-route-progress-item--locked">
      <button class="oc-block-route-progress-link" type="button"><span class="oc-block-route-progress-marker"><iconify-icon icon="mdi:flag-checkered" aria-label="Finish"></iconify-icon></span><span class="oc-block-route-progress-text"><span class="oc-block-route-progress-name">Finish</span><span class="oc-block-route-progress-sub">Opens after 4 steps</span></span><span class="oc-block-route-progress-value">1.1 km</span></button>
    </li>
      @endif
  </ol>
</section>
