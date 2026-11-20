{{-- OmniaUI block: hero-orbit - Landing hero with a code window and product marks that slowly orbit around it. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/hero-orbit.html | Map: section -> container + split -> copy (eyebrow, display, lead, buttons) -> visual (ring with marks + center window)
     Class API: .oc-block-orbit-visual (square stage), -ring (turning circle), -mark (style="--oc-orbit-angle: 60deg"),
       -center (the code window or any visual). --oc-orbit-duration sets the speed (default 60s). Reduced motion: no orbit.
       Copy uses the showcase classes (.oc-eyebrow, .oc-display, .oc-text-gradient, .oc-lead, .oc-btn--gradient / --glass).
     Blade: <x-oc::block.hero-orbit> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): eyebrow, title, lead, actions, center, default.
     Props (0.17.0, all optional; a filled slot wins): heading-level (1|2; 2 renders h2.oc-display--md), split-lead (wider copy column,
       .oc-split--lead), float (.oc-block-orbit-visual--float: up to eight marks float around the window), duration ("30s"),
       marks (array of ['glyph' => ..., 'accent' => 'green', 'angle' => 45]; spread evenly from start-angle when angle is empty),
       start-angle (degrees, default 0), mark-size (sm|md|lg, default sm), soft-marks (.oc-product-mark--soft),
       code-title + code (the code window), center-mark (['glyph' => ..., 'accent' => 'blue']: a big product mark instead of the window).
--}}
@props(['eyebrow' => null, 'title' => null, 'lead' => null, 'actions' => null, 'center' => null, 'headingLevel' => 1, 'splitLead' => false, 'float' => false, 'duration' => null, 'marks' => null, 'startAngle' => 0, 'markSize' => 'sm', 'softMarks' => false, 'codeTitle' => null, 'code' => null, 'centerMark' => null])
@php
    $ocOrbitH = (int) $headingLevel === 2 ? 'h2' : 'h1';
    $ocOrbitMarks = is_array($marks) ? array_values($marks) : null;
    $ocOrbitMarkClass = 'oc-product-mark'.(in_array($markSize, ['sm', 'lg', 'xl'], true) ? ' oc-product-mark--'.$markSize : '').($softMarks ? ' oc-product-mark--soft' : '');
@endphp
<section {{ $attributes->merge(['class' => 'oc-block-orbit oc-section-pad']) }}>
  <div class="oc-container oc-split{{ $splitLead ? ' oc-split--lead' : '' }}">
    <div>
      <p class="oc-eyebrow">
          @if (isset($eyebrow) && trim((string) $eyebrow) !== '')
              {{ $eyebrow }}
          @else
          Software studio &middot; since 2012
          @endif
      </p>
      <{{ $ocOrbitH }} class="oc-display{{ $ocOrbitH === 'h2' ? ' oc-display--md' : '' }}">
          @if (isset($title) && trim((string) $title) !== '')
              {{ $title }}
          @else
          One team for all your <span class="oc-text-gradient">software</span>.
          @endif
      </{{ $ocOrbitH }}>
      <p class="oc-lead">
          @if (isset($lead) && trim((string) $lead) !== '')
              {{ $lead }}
          @else
          Business apps, websites and desktop tools. We design, build and maintain them, and stay your single point of contact.
          @endif
      </p>
      <div class="flex flex-wrap gap-1 mt-2">
          @if (isset($actions) && trim((string) $actions) !== '')
              {{ $actions }}
          @else
        <a class="oc-btn oc-btn--gradient oc-btn--lg" href="#products">See our products &rarr;</a>
        <a class="oc-btn oc-btn--glass oc-btn--lg" href="#contact">Start a project</a>
          @endif
      </div>
    </div>
    <div class="oc-block-orbit-visual{{ $float ? ' oc-block-orbit-visual--float' : '' }}"@if ($duration) style="--oc-orbit-duration: {{ $duration }};"@endif>
      <div class="oc-block-orbit-ring" aria-hidden="true">
          @if (! $slot->isEmpty())
              {{ $slot }}
          @elseif ($ocOrbitMarks !== null)
              @foreach ($ocOrbitMarks as $ocI => $ocMark)
                  <span class="oc-block-orbit-mark"@unless ($float) style="--oc-orbit-angle: {{ $ocMark['angle'] ?? ((float) $startAngle + (360 / count($ocOrbitMarks)) * $ocI) }}deg;"@endunless><span class="{{ $ocOrbitMarkClass }}{{ ! empty($ocMark['accent']) ? ' oc-accent--'.$ocMark['accent'] : '' }}">{{ $ocMark['glyph'] ?? '' }}</span></span>
              @endforeach
          @else
        <span class="oc-block-orbit-mark" style="--oc-orbit-angle: 0deg;"><span class="oc-product-mark oc-product-mark--sm oc-accent--green">&#9670;</span></span>
        <span class="oc-block-orbit-mark" style="--oc-orbit-angle: 60deg;"><span class="oc-product-mark oc-product-mark--sm oc-accent--violet">&#9673;</span></span>
        <span class="oc-block-orbit-mark" style="--oc-orbit-angle: 120deg;"><span class="oc-product-mark oc-product-mark--sm oc-accent--orange">&#9650;</span></span>
        <span class="oc-block-orbit-mark" style="--oc-orbit-angle: 180deg;"><span class="oc-product-mark oc-product-mark--sm oc-accent--cyan">&#9733;</span></span>
        <span class="oc-block-orbit-mark" style="--oc-orbit-angle: 240deg;"><span class="oc-product-mark oc-product-mark--sm oc-accent--red">&#9829;</span></span>
        <span class="oc-block-orbit-mark" style="--oc-orbit-angle: 300deg;"><span class="oc-product-mark oc-product-mark--sm oc-accent--yellow">&#9728;</span></span>
          @endif
      </div>
@if (is_array($centerMark) && ! (isset($center) && trim((string) $center) !== ''))
      <span class="oc-block-orbit-center oc-product-mark oc-product-mark--xl{{ ! empty($centerMark['accent']) ? ' oc-accent--'.$centerMark['accent'] : '' }}" style="inline-size: var(--oc-mark-size);" aria-hidden="true">{{ $centerMark['glyph'] ?? '' }}</span>
@else
      <div class="oc-code-window oc-block-orbit-center">
          @if (isset($center) && trim((string) $center) !== '')
              {{ $center }}
          @elseif ($code !== null || $codeTitle !== null)
        <div class="oc-code-window__bar"><i></i><i></i><i></i>@if ($codeTitle !== null)<span class="oc-code-window__title">{{ $codeTitle }}</span>@endif</div>
<pre class="oc-code-window__body">{{ $code }}</pre>
          @else
        <div class="oc-code-window__bar"><i></i><i></i><i></i><span class="oc-code-window__title">products.php</span></div>
<pre class="oc-code-window__body">return [
  'erp'    => Product 1::class,
  'shop'   => Product 2::class,
  'design' => Product 3::class,
  'next'   => YourProject::class,
];</pre>
          @endif
      </div>
@endif
    </div>
  </div>
</section>
