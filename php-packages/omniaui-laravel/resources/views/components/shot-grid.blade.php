{{-- File: resources/views/components/shot-grid.blade.php | Map: div.oc-shot-grid (min, ratio) -> figure.oc-shot per item (link or plain image, caption) -> slot
     OmniaUI shot grid: an auto-fit grid of screenshots with captions (packages/ui/snippets/shot-grid.html). Needs @birdycom/omniaui CSS.
     Props: items (list of ['src', 'alt', 'caption', 'href' (default the image; false = no link), 'width', 'height']),
            min (--oc-shot-min, default 18rem), ratio (--oc-shot-ratio, default 16 / 10). Slot: extra figure.oc-shot elements. --}}
@props(['items' => [], 'min' => null, 'ratio' => null])
@php
    $style = trim(($min ? '--oc-shot-min: '.$min.'; ' : '').($ratio ? '--oc-shot-ratio: '.$ratio.';' : ''));
@endphp
<div {{ $attributes->class(['oc-shot-grid'])->merge($style !== '' ? ['style' => $style] : []) }}>
    @foreach ($items as $item)
        @php
            $link = ($item['href'] ?? null) === false ? null : ($item['href'] ?? $item['src']);
        @endphp
        <figure class="oc-shot">
            @if ($link)
                <a href="{{ $link }}"><img src="{{ $item['src'] }}" alt="{{ $item['alt'] ?? '' }}" loading="lazy" width="{{ $item['width'] ?? 640 }}" height="{{ $item['height'] ?? 400 }}"></a>
            @else
                <img src="{{ $item['src'] }}" alt="{{ $item['alt'] ?? '' }}" loading="lazy" width="{{ $item['width'] ?? 640 }}" height="{{ $item['height'] ?? 400 }}">
            @endif
            @if (! empty($item['caption']))
                <figcaption>{{ $item['caption'] }}</figcaption>
            @endif
        </figure>
    @endforeach
    {{ $slot }}
</div>
