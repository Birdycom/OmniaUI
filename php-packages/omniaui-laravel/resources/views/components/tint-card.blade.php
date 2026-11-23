{{-- OmniaUI tint card: a link card tinted in one color with a large drifting webicon in the corner.
     Props: title, href (without it an <article>), icon (webicon name), tone (success|warning|destructive|info|muted),
     meta, size (lg), level (2-4, default 3), arrow (default true), fill (Pro shape, needs OmniaUI Pro CSS),
     title-href (a link on the title, .oc-tint-card__link covers the card, while the card stays an <article>). Slot = the text. --}}
@props(['title' => '', 'href' => null, 'icon' => null, 'tone' => null, 'meta' => null, 'size' => null, 'level' => 3, 'arrow' => true, 'fill' => false, 'titleHref' => null])
@php($tag = $href ? 'a' : 'article')
<{{ $tag }} @if ($href) href="{{ $href }}" @endif {{ $attributes->class(['oc-tint-card', 'oc-tint-card--'.$tone => $tone && $tone !== 'primary', 'oc-tint-card--lg' => $size === 'lg', 'oc-tint-card--fill' => $fill]) }}>
    @if ($icon)
        <x-oc::webicon class="oc-tint-card__art" :name="$icon" bare fallback="iconify" />
    @endif
    <div class="oc-tint-card__head">
        <h{{ $level }} class="oc-tint-card__title">@if ($titleHref && ! $href)<a class="oc-tint-card__link" href="{{ $titleHref }}">{{ $title }}</a>@else{{ $title }}@endif</h{{ $level }}>
        @if ($arrow)
            <span class="oc-tint-card__go" aria-hidden="true"><x-oc::webicon name="material-symbols:arrow-outward-rounded" bare fallback="iconify" /></span>
        @endif
    </div>
    @if (trim((string) $slot) !== '')
        <p class="oc-tint-card__text">{{ $slot }}</p>
    @endif
    @if ($meta)
        <p class="oc-tint-card__meta">{{ $meta }}</p>
    @endif
</{{ $tag }}>
