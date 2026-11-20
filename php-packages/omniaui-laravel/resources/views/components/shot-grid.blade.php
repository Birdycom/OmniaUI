{{-- File: resources/views/components/shot-grid.blade.php | Map: div.oc-shot-grid (min, ratio) -> figure.oc-shot per item (link, lightbox button or plain image, caption) -> slot -> lightbox per item
     OmniaUI shot grid: an auto-fit grid of screenshots with captions (packages/ui/snippets/shot-grid.html). Needs @birdycom/omniaui CSS.
     Props: items (list of ['src', 'alt', 'caption', 'href' (default the image; false = no link), 'width', 'height']),
            min (--oc-shot-min, default 18rem), ratio (--oc-shot-ratio, default 16 / 10),
            lightbox (0.17.0: every image is a button that opens it large in an <x-oc::lightbox> after the grid, command="show-modal",
            no JavaScript), lightbox-id (id prefix of those dialogs; default derived from the items). Slot: extra figure.oc-shot elements. --}}
@props(['items' => [], 'min' => null, 'ratio' => null, 'lightbox' => false, 'lightboxId' => null])
@php
    $style = trim(($min ? '--oc-shot-min: '.$min.'; ' : '').($ratio ? '--oc-shot-ratio: '.$ratio.';' : ''));
    $viewId = fn ($i) => ($lightboxId ?? 'oc-shot-'.substr(md5((string) json_encode($items)), 0, 8)).'-'.($i + 1);
@endphp
<div {{ $attributes->class(['oc-shot-grid'])->merge($style !== '' ? ['style' => $style] : []) }}>
    @foreach ($items as $i => $item)
        @php
            $link = ($item['href'] ?? null) === false ? null : ($item['href'] ?? $item['src']);
        @endphp
        <figure class="oc-shot">
            @if ($lightbox)
                <button type="button" command="show-modal" commandfor="{{ $viewId($i) }}" aria-label="Open the screenshot: {{ $item['alt'] ?? '' }}"><img src="{{ $item['src'] }}" alt="{{ $item['alt'] ?? '' }}" loading="lazy" width="{{ $item['width'] ?? 640 }}" height="{{ $item['height'] ?? 400 }}"></button>
            @elseif ($link)
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
@if ($lightbox)
    @foreach ($items as $i => $item)
        <x-oc::lightbox :id="$viewId($i)" :images="[['src' => $item['src'], 'alt' => $item['alt'] ?? '', 'caption' => $item['caption'] ?? null]]" :title="$item['caption'] ?? null" :label="$item['alt'] ?? 'Screenshot'" :thumbnails="false" />
    @endforeach
@endif
