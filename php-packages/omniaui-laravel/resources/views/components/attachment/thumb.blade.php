{{-- File: resources/views/components/attachment/thumb.blade.php | Map: props -> .oc-attachment-thumb (img or placeholder art, remove button)
     Square thumbnail of a pasted screenshot. Props: src, alt, art, removeLabel (adds the remove button), as (div|span). --}}
@props(['src' => null, 'alt' => '', 'art' => null, 'removeLabel' => null, 'as' => 'div'])
<{{ $as }} {{ $attributes->class(['oc-attachment-thumb']) }}>
    @if ($src)
        <img src="{{ $src }}" alt="{{ $alt }}">
    @else
        <span @class(['oc-media-art', 'oc-media-art--'.$art => $art !== null]) role="img" aria-label="{{ $alt }}"></span>
    @endif
    @if ($removeLabel)
        <button type="button" class="oc-attachment__remove" aria-label="{{ $removeLabel }}">&#10005;</button>
    @endif
</{{ $as }}>
