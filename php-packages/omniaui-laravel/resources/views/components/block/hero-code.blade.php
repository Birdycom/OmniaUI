{{-- OmniaUI block: hero-code — Landing hero: eyebrow, display title with gradient word, lead, two buttons and a code window with floating icon tiles. Needs @birdycom/omniaui.
     File: packages/blocks/blocks/hero-code.html | Map: section -> container.oc-split -> copy (eyebrow, title, lead, actions) -> visual (tiles + code window)
     Blade: <x-oc::block.hero-code> - attributes merge onto the root element. Written by hand (array props).
     Props (same names as BlockHeroCode in React): eyebrow, title, lead, code-title, code, tiles, code-dark (default true, as in the snippet).
       tiles: list of ['glyph', 'accent', 'style' (CSS string)]; :tiles="[]" shows no tiles.
       Left out (null), every prop shows the snippet content; :eyebrow="false" / :lead="false" hide that line.
     Blade slots: title, lead, actions (buttons), default (replaces the whole inside of the section).
--}}
@props(['eyebrow' => null, 'title' => null, 'lead' => null, 'actions' => null, 'codeTitle' => null, 'code' => null, 'tiles' => null, 'codeDark' => true])
@php($filled = fn ($v) => $v !== null && $v !== false && trim((string) $v) !== '')
<section {{ $attributes->merge(['class' => 'oc-section-pad']) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <div class="oc-container oc-split">
    <div>
      @if ($eyebrow !== false)
      <p class="oc-eyebrow">@if ($filled($eyebrow)){{ $eyebrow }}@else Software development &middot; for small companies @endif</p>
      @endif
      <h1 class="oc-display">@if ($filled($title)){{ $title }}@else One app for quotes, orders and <span class="oc-text-gradient">invoices</span>. @endif</h1>
      @if ($lead !== false)
      <p class="oc-lead">@if ($filled($lead)){{ $lead }}@else From a modular ERP to a custom app for a single customer: we design, build and maintain web applications, desktop tools and plugins. @endif</p>
      @endif
      @if ($actions !== false)
      <div class="flex flex-wrap gap-1 mt-2">
        @if ($filled($actions))
        {{ $actions }}
        @else
        <a class="oc-btn oc-btn--gradient oc-btn--lg" href="#software">View our software &rarr;</a>
        <a class="oc-btn oc-btn--glass oc-btn--lg" href="#contact">Discuss your project</a>
        @endif
      </div>
      @endif
    </div>
    <div class="relative p-2">
      @if (is_array($tiles))
      @foreach ($tiles as $tile)
      <span class="oc-icon-tile oc-icon-tile--float oc-accent--{{ $tile['accent'] ?? 'green' }} absolute"@if (! empty($tile['style'])) style="{{ $tile['style'] }}"@endif aria-hidden="true">{{ $tile['glyph'] ?? '' }}</span>
      @endforeach
      @else
      <span class="oc-icon-tile oc-icon-tile--float oc-accent--green absolute" style="inset: -0.5rem auto auto 8%;" aria-hidden="true">&#9670;</span>
      <span class="oc-icon-tile oc-icon-tile--float oc-accent--violet absolute" style="inset: 0 6% auto auto; animation-delay: -2s;" aria-hidden="true">&#9673;</span>
      <span class="oc-icon-tile oc-icon-tile--float oc-accent--orange absolute" style="inset: auto 10% -0.5rem auto; animation-delay: -4s;" aria-hidden="true">&#9650;</span>
      @endif
      <div @class(['oc-code-window', 'oc-code-window--dark' => $codeDark])>
        <div class="oc-code-window__bar"><i></i><i></i><i></i>@if ($codeTitle !== false)<span class="oc-code-window__title">@if ($filled($codeTitle)){{ $codeTitle }}@else projects.php @endif</span>@endif</div>
@if ($code !== null)
<pre class="oc-code-window__body">{{ $code }}</pre>
@else
<pre class="oc-code-window__body">return [
  'erp'    => Erp::class,
  'design' => OmniaCSS::class,
  'next'   => YourProject::class,
];</pre>
@endif
      </div>
    </div>
  </div>
    @endif
</section>
