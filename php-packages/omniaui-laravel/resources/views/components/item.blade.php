{{-- OmniaCSS item (list row). Props: variant (outline|muted), size (sm), href (renders an <a>, interactive), title, description.
     Slots: media (left; wrap in .oc-item-media), actions (right), header / footer (full-width rows), default = extra content inside .oc-item-content. --}}
@props(['variant' => null, 'size' => null, 'href' => null, 'title' => null, 'description' => null])
@php
    $tag = $href ? 'a' : 'div';
    $classes = ['oc-item', 'oc-item--'.$variant => $variant, 'oc-item--'.$size => $size && $size !== 'md', 'oc-item--interactive' => $href];
@endphp
<{{ $tag }} {{ $attributes->class($classes)->merge($href ? ['href' => $href] : []) }}>
    @if (isset($header) && trim((string) $header) !== '')
        <div class="oc-item-header">{{ $header }}</div>
    @endif
    @if (isset($media) && trim((string) $media) !== '')
        {{ $media }}
    @endif
    <div class="oc-item-content">
        @if ($title !== null)
            <p class="oc-item-title">{{ $title }}</p>
        @endif
        @if ($description !== null)
            <p class="oc-item-description">{{ $description }}</p>
        @endif
        {{ $slot }}
    </div>
    @if (isset($actions) && trim((string) $actions) !== '')
        <div class="oc-item-actions">{{ $actions }}</div>
    @endif
    @if (isset($footer) && trim((string) $footer) !== '')
        <div class="oc-item-footer">{{ $footer }}</div>
    @endif
</{{ $tag }}>
