{{-- OmniaUI gallery: one large photo and thumbnails, CSS only (radios + :has, up to 8 photos).
     Props: images (array of ['src', 'alt', 'thumb' => optional, 'thumb_alt' => optional]), label ("Photos"), badge, side, name. --}}
@props(['images' => [], 'label' => 'Photos', 'badge' => null, 'side' => false, 'name' => null])
@php
    $list = array_slice(array_values($images), 0, 8);
    $name = $name ?? 'oc-gallery-'.substr(md5(json_encode($list)), 0, 8);
@endphp
<div {{ $attributes->class(['oc-gallery', 'oc-gallery--side' => $side]) }}>
    <div class="oc-gallery__stage">
        @if ($badge)<span class="oc-badge oc-badge--destructive oc-gallery__badge">{{ $badge }}</span>@endif
        @foreach ($list as $i => $img)
            <figure class="oc-gallery__slide"><img src="{{ $img['src'] }}" alt="{{ $img['alt'] ?? '' }}" @if($i) loading="lazy" @endif></figure>
        @endforeach
    </div>
    @if (count($list) > 1)
        <fieldset class="oc-gallery__thumbs">
            <legend>{{ $label }}</legend>
            @foreach ($list as $i => $img)
                <label class="oc-gallery__thumb"><input type="radio" name="{{ $name }}" @checked($i === 0)><img src="{{ $img['thumb'] ?? $img['src'] }}" alt="{{ $img['thumb_alt'] ?? $img['alt'] ?? '' }}"></label>
            @endforeach
        </fieldset>
    @endif
</div>
