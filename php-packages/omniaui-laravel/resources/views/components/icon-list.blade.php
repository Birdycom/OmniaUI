{{-- File: resources/views/components/icon-list.blade.php | Map: variant -> ul.oc-icon-list (icon rows | --points: tile + title + text) | ul.oc-list--accent
     OmniaUI icon list for a company site (packages/ui/snippets/icon-list.html). Needs @birdycom/omniaui CSS.
     Props: items (list of ['icon' => webicon name, 'text', 'title' (points), 'accent' (tile)]), variant (icons|points|accent), accent (every tile).
     pills (list of texts: div.oc-badge-row of span.oc-pill) and tagline (p.oc-tagline--accent) above the list, note (p.oc-note) under it.
     Slot: extra <li> rows. --}}
@props(['items' => [], 'variant' => 'icons', 'accent' => null, 'pills' => [], 'tagline' => null, 'note' => null])
@if (! empty($pills))
    <div class="oc-badge-row">@foreach ($pills as $pill)<span class="oc-pill">{{ $pill }}</span>@endforeach</div>
@endif
@if ($tagline)
    <p class="oc-tagline--accent">{{ $tagline }}</p>
@endif
@if ($variant === 'accent')
    <ul {{ $attributes->class(['oc-list--accent']) }}>
        @foreach ($items as $item)
            <li>{{ is_array($item) ? ($item['text'] ?? '') : $item }}</li>
        @endforeach
        {{ $slot }}
    </ul>
@else
    <ul {{ $attributes->class(['oc-icon-list', 'oc-icon-list--points' => $variant === 'points']) }}>
        @foreach ($items as $item)
            @if ($variant === 'points')
                <li><span @class(['oc-icon-tile oc-icon-tile--sm', 'oc-accent--'.($item['accent'] ?? $accent) => $item['accent'] ?? $accent]) aria-hidden="true">@if (! empty($item['icon']))<x-oc::webicon :name="$item['icon']" bare fallback="iconify" />@endif</span>@if (! empty($item['title']))<span class="oc-icon-list__title">{{ $item['title'] }}</span>@endif @if (! empty($item['text']))<span class="oc-icon-list__text">{{ $item['text'] }}</span>@endif</li>
            @else
                <li>@if (! empty($item['icon']))<x-oc::webicon :name="$item['icon']" bare fallback="iconify" />@endif{{ $item['text'] ?? '' }}</li>
            @endif
        @endforeach
        {{ $slot }}
    </ul>
@endif
@if ($note)
    <p class="oc-note">{{ $note }}</p>
@endif
