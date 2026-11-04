{{-- OmniaUI tint card: a link card tinted in one color with a large drifting webicon in the corner.
     Props: title, href (without it an <article>), icon (webicon name), tone (success|warning|destructive|info|muted),
     meta, size (lg), level (2-4, default 3), arrow (default true), fill (Pro shape, needs OmniaUI Pro CSS). Slot = the text. --}}
@props(['title' => '', 'href' => null, 'icon' => null, 'tone' => null, 'meta' => null, 'size' => null, 'level' => 3, 'arrow' => true, 'fill' => false])
@php($tag = $href ? 'a' : 'article')
<{{ $tag }} @if ($href) href="{{ $href }}" @endif {{ $attributes->class(['oc-tint-card', 'oc-tint-card--'.$tone => $tone && $tone !== 'primary', 'oc-tint-card--lg' => $size === 'lg', 'oc-tint-card--fill' => $fill]) }}>
    @if ($icon)
        <iconify-icon class="oc-tint-card__art" icon="{{ $icon }}" aria-hidden="true"></iconify-icon>
    @endif
    <div class="oc-tint-card__head">
        <h{{ $level }} class="oc-tint-card__title">{{ $title }}</h{{ $level }}>
        @if ($arrow)
            <span class="oc-tint-card__go" aria-hidden="true"><iconify-icon icon="material-symbols:arrow-outward-rounded"></iconify-icon></span>
        @endif
    </div>
    @if (trim((string) $slot) !== '')
        <p class="oc-tint-card__text">{{ $slot }}</p>
    @endif
    @if ($meta)
        <p class="oc-tint-card__meta">{{ $meta }}</p>
    @endif
</{{ $tag }}>
