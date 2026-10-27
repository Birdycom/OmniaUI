{{-- File: resources/views/components/attachment/image.blade.php | Map: props -> a.oc-attachment-image (img or placeholder art, caption)
     Image preview inside a message (4 : 3). Props: href, src (empty = placeholder art), alt, art (placeholder variant), caption. --}}
@props(['href' => null, 'src' => null, 'alt' => '', 'art' => null, 'caption' => null])
<a {{ $attributes->class(['oc-attachment-image'])->merge(['href' => $href]) }}>
    @if ($src)
        <img src="{{ $src }}" alt="{{ $alt }}">
    @else
        <span @class(['oc-media-art', 'oc-media-art--'.$art => $art !== null]) role="img" aria-label="{{ $alt }}"></span>
    @endif
    @if ($caption)
        <span class="oc-attachment-image__caption">{{ $caption }}</span>
    @endif
</a>
