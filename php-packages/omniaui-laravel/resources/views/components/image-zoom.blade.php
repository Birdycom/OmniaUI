{{-- File: resources/views/components/image-zoom.blade.php | Map: props -> toolbar (radio levels) -> viewport -> canvas
     OmniaUI image zoom, CSS only. Props: src, alt, levels (default [1, 1.5, 2, 3]; [] = no toolbar), zoom (start level, default 1),
     ratio (square|photo or a CSS ratio), name (radio group name). Slot: replaces the <img> (svg, video, art).
     The CSS reads the checked radio with :has(); supported values: 1, 1.5, 2, 3, 4. --}}
@props(['src' => null, 'alt' => '', 'levels' => [1, 1.5, 2, 3], 'zoom' => 1, 'ratio' => null, 'name' => null])
@php
    $name = $name ?: 'oc-zoom-'.substr(md5(uniqid('', true)), 0, 6);
    $preset = in_array($ratio, ['square', 'photo'], true) ? $ratio : null;
    // Without a toolbar the start level is written straight to --oc-zoom.
    $style = trim(($ratio && ! $preset ? '--oc-image-zoom-ratio: '.$ratio.'; ' : '').(! count($levels) && $zoom != 1 ? '--oc-zoom: '.$zoom : ''));
@endphp
<div {{ $attributes->class(['oc-image-zoom', 'oc-image-zoom--'.$preset => $preset])->merge($style ? ['style' => $style] : []) }}>
    @if (count($levels))
        <div class="oc-image-zoom__toolbar" role="radiogroup" aria-label="Zoom level">
            <span class="oc-image-zoom__label">Zoom</span>
            @foreach ($levels as $level)
                <label class="oc-image-zoom__level"><input type="radio" name="{{ $name }}" value="{{ $level }}" @checked($level == $zoom)>{{ round($level * 100) }}%</label>
            @endforeach
        </div>
    @endif
    <div class="oc-image-zoom__viewport" tabindex="0" role="region" aria-label="{{ $alt ? $alt.', scroll to pan' : 'Scroll to pan' }}">
        <div class="oc-image-zoom__canvas">
            @if (! $slot->isEmpty())
                {{ $slot }}
            @elseif ($src)
                <img src="{{ $src }}" alt="{{ $alt }}">
            @else
                <div class="oc-media-art" role="img" aria-label="{{ $alt }}"></div>
            @endif
        </div>
    </div>
</div>
