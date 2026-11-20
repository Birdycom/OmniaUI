{{-- OmniaUI block: showcase — Portfolio grid: project cards with a browser frame around the screenshot. Needs @birdycom/omniaui.
     File: packages/blocks/blocks/showcase.html | Map: section -> container -> eyebrow, title -> .oc-card-grid of browser-framed .oc-product-card links
     Blade: <x-oc::block.showcase> - attributes merge onto the root element. Written by hand (array props).
     Props (same names as BlockShowcase in React): eyebrow, title, projects, card-min (default 20rem, as in the snippet).
       projects: list of ['href', 'accent', 'background' (CSS background), 'image', 'imageAlt', 'pill' (or 'tag'), 'name', 'summary', 'more'].
       Left out (null), eyebrow, title and projects show the snippet content; :eyebrow="false" hides the eyebrow.
     Blade slots: title (HTML title, e.g. with a .oc-text-gradient word), default (replaces the whole inside of the section).
--}}
@props(['eyebrow' => null, 'title' => null, 'projects' => null, 'cardMin' => '20rem'])
@php($filled = fn ($v) => $v !== null && $v !== false && trim((string) $v) !== '')
<section {{ $attributes->merge(['class' => 'oc-section-pad']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <div class="oc-container">
    @if ($eyebrow !== false)
    <p class="oc-eyebrow">@if ($filled($eyebrow)){{ $eyebrow }}@else Work @endif</p>
    @endif
    <h2 class="oc-display oc-display--md">@if ($filled($title)){{ $title }}@else Websites made to measure. Different for every client. @endif</h2>
    <div class="oc-card-grid" style="--oc-card-min: {{ $cardMin }};">
      @if (is_array($projects))
      @foreach ($projects as $project)
      <a @class(['oc-product-card', 'oc-accent--'.($project['accent'] ?? '') => ! empty($project['accent']), 'p-0 overflow-hidden']) href="{{ $project['href'] ?? '#' }}">
        <span class="oc-browser-frame m-1"><span class="oc-browser-frame__bar"><i></i><i></i><i></i></span><span class="oc-browser-frame__body"@if (! empty($project['background'])) style="background: {{ $project['background'] }}"@endif>@if (! empty($project['image']))<img src="{{ $project['image'] }}" alt="{{ $project['imageAlt'] ?? '' }}">@endif</span></span>
        <span class="grid gap-0.5 p-1.5 pt-0">
          @if (! empty($project['pill'] ?? $project['tag'] ?? null))
          <span class="oc-pill oc-pill--accent justify-self-start">{{ $project['pill'] ?? $project['tag'] }}</span>
          @endif
          <span class="oc-product-card__name">{{ $project['name'] ?? '' }}</span>
          @if (! empty($project['summary']))
          <span class="oc-product-card__summary">{{ $project['summary'] }}</span>
          @endif
          @if (! empty($project['more']))
          <span class="oc-product-card__more">{{ $project['more'] }}</span>
          @endif
        </span>
      </a>
      @endforeach
      @else
      <a class="oc-product-card oc-accent--green p-0 overflow-hidden" href="#">
        <span class="oc-browser-frame m-1"><span class="oc-browser-frame__bar"><i></i><i></i><i></i></span><span class="oc-browser-frame__body oc-media-art oc-media-art--4"></span></span>
        <span class="grid gap-0.5 p-1.5 pt-0">
          <span class="oc-pill oc-pill--accent justify-self-start">Website with CMS</span>
          <span class="oc-product-card__name">Project 1</span>
          <span class="oc-product-card__summary">Garden design and maintenance</span>
          <span class="oc-product-card__more">View the project</span>
        </span>
      </a>
      <a class="oc-product-card oc-accent--blue p-0 overflow-hidden" href="#">
        <span class="oc-browser-frame m-1"><span class="oc-browser-frame__bar"><i></i><i></i><i></i></span><span class="oc-browser-frame__body oc-media-art"></span></span>
        <span class="grid gap-0.5 p-1.5 pt-0">
          <span class="oc-pill oc-pill--accent justify-self-start">Custom website</span>
          <span class="oc-product-card__name">Project 2</span>
          <span class="oc-product-card__summary">Plumbing and central heating</span>
          <span class="oc-product-card__more">View the project</span>
        </span>
      </a>
      @endif
    </div>
  </div>
    @endif
</section>
