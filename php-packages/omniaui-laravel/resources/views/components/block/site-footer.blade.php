{{-- OmniaUI block: site-footer — Brand column, three link columns and a bottom bar. Needs @birdycom/omniaui.
     Blade: <x-oc::block.site-footer> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): default (the whole inside of the footer).
     Props (all optional; with none of them and an empty slot the snippet content is shown):
       variant (center|dark), brand (slot or string: content of the brand link), brand-href ('/'), brand-mark (array: name, accent,
       tagline, label = aria-label; small .oc-brand-mark as the logo link, slot brand-icon for its svg), about,
       columns (array of ['title', 'links' => [['label', 'href']], 'lines' => address lines [['label', 'href'?]], 'more' => [['title', 'links']]]),
       contact (['title', 'lines' => [['label', 'href'?]]]), row (links of the centred variant), social ([['label', 'href', 'icon' => webicon]]),
       social-label ('Social media'), newsletter (['action', 'method' = post, 'label', 'placeholder', 'name', 'button', 'id']),
       copyright, legal ([['label', 'href']]), build, credit.
     Hand-written (MANUAL in tools/build-blocks.mjs): keep the default output equal to packages/blocks/blocks/site-footer.html.
--}}
@props(['variant' => null, 'brand' => null, 'brandHref' => '/', 'brandMark' => null, 'brandIcon' => null, 'about' => null, 'columns' => null, 'contact' => null, 'row' => null, 'social' => null, 'socialLabel' => 'Social media', 'newsletter' => null, 'copyright' => null, 'legal' => null, 'build' => null, 'credit' => null])
@php
    $filled = fn ($v) => isset($v) && trim((string) $v) !== '';
    $built = $columns !== null || $contact !== null || $row !== null || $social !== null || $newsletter !== null || $legal !== null
        || $brandMark !== null || $filled($brand) || $filled($about) || $filled($copyright) || $filled($credit) || $filled($build);
    $center = $variant === 'center';
    $hasLegal = ! empty($legal) || $filled($build);
    $mailId = is_array($newsletter) ? ($newsletter['id'] ?? 'oc-ft-mail') : null;
    $mailMethod = is_array($newsletter) ? strtolower($newsletter['method'] ?? 'post') : 'post';
@endphp
<footer {{ $attributes->merge(['class' => 'oc-site-footer'.($variant ? ' oc-site-footer--'.$variant : '')]) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @elseif ($built)
  <div class="oc-container">
    @if ($center)
    <div class="oc-site-footer__about">
        @if (is_array($brandMark))
        <x-oc::brand-mark size="sm" :href="$brandHref" :name="$brandMark['name'] ?? ''" :accent="$brandMark['accent'] ?? null" :tagline="$brandMark['tagline'] ?? null" :aria-label="$brandMark['label'] ?? null">
            @if ($filled($brandIcon))
            <x-slot:icon>{{ $brandIcon }}</x-slot:icon>
            @endif
        </x-oc::brand-mark>
        @else
        <a class="oc-site-header__brand" href="{{ $brandHref }}">{{ $brand }}</a>
        @endif
        @if ($filled($about))
        <p>{{ $about }}</p>
        @endif
    </div>
        @if (! empty($row))
    <ul class="oc-site-footer__row">@foreach ($row as $link)<li><a href="{{ $link['href'] ?? '#' }}">{{ $link['label'] ?? '' }}</a></li>@endforeach</ul>
        @endif
        @if (! empty($social))
    <ul class="oc-site-footer__social" aria-label="{{ $socialLabel }}">@foreach ($social as $s)<li><a href="{{ $s['href'] ?? '#' }}" aria-label="{{ $s['label'] ?? '' }}"><x-oc::webicon :name="$s['icon']" bare fallback="iconify" /></a></li>@endforeach</ul>
        @endif
    @else
    <div class="oc-site-footer__grid">
      <div class="oc-site-footer__about">
        @if (is_array($brandMark))
        <x-oc::brand-mark size="sm" :href="$brandHref" :name="$brandMark['name'] ?? ''" :accent="$brandMark['accent'] ?? null" :tagline="$brandMark['tagline'] ?? null" :aria-label="$brandMark['label'] ?? null">
            @if ($filled($brandIcon))
            <x-slot:icon>{{ $brandIcon }}</x-slot:icon>
            @endif
        </x-oc::brand-mark>
        @else
        <a class="oc-site-header__brand" href="{{ $brandHref }}">{{ $brand }}</a>
        @endif
        @if ($filled($about))
        <p>{{ $about }}</p>
        @endif
        @if (is_array($newsletter))
        <form class="oc-site-footer__signup" @if (isset($newsletter['action'])) action="{{ $newsletter['action'] }}" method="{{ $mailMethod }}" @endif>
            @if (isset($newsletter['action']) && $mailMethod !== 'get') @csrf @endif
            <label class="oc-visually-hidden" for="{{ $mailId }}">{{ $newsletter['label'] ?? 'E-mail' }}</label><input class="oc-input" id="{{ $mailId }}" type="email" name="{{ $newsletter['name'] ?? 'email' }}" @if (isset($newsletter['placeholder'])) placeholder="{{ $newsletter['placeholder'] }}" @endif autocomplete="email" required><button class="oc-btn" type="submit">{{ $newsletter['button'] ?? 'Subscribe' }}</button>
        </form>
            @if (! empty($social))
        <div style="margin-block-start:1.25rem"><ul class="oc-site-footer__social" aria-label="{{ $socialLabel }}">@foreach ($social as $s)<li><a href="{{ $s['href'] ?? '#' }}" aria-label="{{ $s['label'] ?? '' }}"><x-oc::webicon :name="$s['icon']" bare fallback="iconify" /></a></li>@endforeach</ul></div>
            @endif
        @elseif (! empty($social))
        <ul class="oc-site-footer__social" aria-label="{{ $socialLabel }}">@foreach ($social as $s)<li><a href="{{ $s['href'] ?? '#' }}" aria-label="{{ $s['label'] ?? '' }}"><x-oc::webicon :name="$s['icon']" bare fallback="iconify" /></a></li>@endforeach</ul>
        @endif
      </div>
      @foreach ($columns ?? [] as $col)
      <div>
        <h2 class="oc-site-footer__title">{{ $col['title'] ?? '' }}</h2>
        @if (! empty($col['links']))
        <ul class="oc-site-footer__list">@foreach ($col['links'] as $link)<li><a href="{{ $link['href'] ?? '#' }}">{{ $link['label'] ?? '' }}</a></li>@endforeach</ul>
        @endif
        @if (! empty($col['lines']))
        <address class="oc-site-footer__list">@foreach ($col['lines'] as $line)@if (! empty($line['href']))<a href="{{ $line['href'] }}">{{ $line['label'] ?? '' }}</a>@else<span>{{ $line['label'] ?? '' }}</span>@endif @endforeach</address>
        @endif
        @foreach ($col['more'] ?? [] as $more)
        <h2 class="oc-site-footer__title oc-site-footer__subtitle">{{ $more['title'] ?? '' }}</h2>
        <ul class="oc-site-footer__list">@foreach ($more['links'] ?? [] as $link)<li><a href="{{ $link['href'] ?? '#' }}">{{ $link['label'] ?? '' }}</a></li>@endforeach</ul>
        @endforeach
      </div>
      @endforeach
      @if (is_array($contact))
      <div>
        <h2 class="oc-site-footer__title">{{ $contact['title'] ?? '' }}</h2>
        <address class="oc-site-footer__list">@foreach ($contact['lines'] ?? [] as $line)@if (! empty($line['href']))<a href="{{ $line['href'] }}">{{ $line['label'] ?? '' }}</a>@else<span>{{ $line['label'] ?? '' }}</span>@endif @endforeach</address>
      </div>
      @endif
    </div>
    @endif
    @if ($filled($copyright) || $filled($credit) || $hasLegal)
    <div class="oc-site-footer__bottom">
      <span>{{ $copyright }}</span>
      @if ($hasLegal)
      <ul class="oc-site-footer__legal">@foreach ($legal ?? [] as $link)<li><a href="{{ $link['href'] ?? '#' }}">{{ $link['label'] ?? '' }}</a></li>@endforeach @if ($filled($build))<li class="oc-site-footer__build">{{ $build }}</li>@endif</ul>
      @endif
      @if ($filled($credit) || (! $hasLegal && ! $center))
      <span>{{ $credit }}</span>
      @endif
    </div>
    @endif
  </div>
    @else
  <div class="oc-container">
    <div class="oc-site-footer__grid">
      <div class="oc-site-footer__about">
        <a class="oc-site-header__brand" href="/"><span class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true">&#9670;</span>Company 1</a>
        <p>Web apps, sites and tools for small companies, built and maintained in-house.</p>
      </div>
      <div>
        <h2 class="oc-site-footer__title">Software</h2>
        <ul class="oc-site-footer__list">
          <li><a href="#">ERP</a></li>
          <li><a href="#">CSS framework</a></li>
          <li><a href="#">Desktop tools</a></li>
        </ul>
      </div>
      <div>
        <h2 class="oc-site-footer__title">Company</h2>
        <ul class="oc-site-footer__list">
          <li><a href="#">Work</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">About</a></li>
        </ul>
      </div>
      <div>
        <h2 class="oc-site-footer__title">Contact</h2>
        <address class="oc-site-footer__list">
          <a href="mailto:info@company1.example">info@company1.example</a>
          <span>Street 1</span>
          <span>1000 City 1</span>
        </address>
      </div>
    </div>
    <div class="oc-site-footer__bottom">
      <span>&copy; 2026 Company 1. All rights reserved.</span>
      <span>Built with OmniaCSS</span>
    </div>
  </div>
    @endif
</footer>
