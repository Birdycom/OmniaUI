{{-- File: resources/views/components/product-card.blade.php | Map: a or article.oc-product-card -> top slot -> name + badge -> tagline -> summary -> more
     OmniaUI product card with a hover lift and an accent glow (the product cards of packages/ui/snippets/fly-in.html). Needs @birdycom/omniaui CSS.
     Props: name, href (a link; else an article), tagline, summary (or the slot), more ("Read more" line), badge ("New"), accent (green, violet ...),
            level (heading 2-4, default 3), fly (.oc-reveal--fly: flies in when it scrolls into view; load fly.js, npx omniaui copy-js fly),
            fly-x (own start offset, --oc-fly-x). Slots: default (summary), top (row above the name). --}}
@props(['name' => '', 'href' => null, 'tagline' => null, 'summary' => null, 'more' => null, 'badge' => null, 'accent' => null, 'level' => 3, 'fly' => false, 'flyX' => null])
@php
    $tag = $href !== null ? 'a' : 'article';
@endphp
<{{ $tag }} {{ $attributes->class(['oc-product-card', 'oc-reveal--fly' => $fly, 'oc-accent--'.$accent => $accent])->merge(array_filter(['href' => $href, 'style' => $flyX ? '--oc-fly-x: '.$flyX : null], fn ($v) => $v !== null)) }}>
    @if (isset($top) && trim((string) $top) !== '')
        <div class="oc-product-card__top">{{ $top }}</div>
    @endif
    <h{{ $level }} class="oc-product-card__name">{{ $name }}@if ($badge) <span class="oc-product-card__badge oc-pill oc-pill--accent">{{ $badge }}</span>@endif</h{{ $level }}>
    @if ($tagline)
        <p class="oc-product-card__tagline">{{ $tagline }}</p>
    @endif
    @if ($summary || ! $slot->isEmpty())
        <p class="oc-product-card__summary">{{ $summary }}{{ $slot }}</p>
    @endif
    @if ($more)
        <span class="oc-product-card__more">{{ $more }}</span>
    @endif
</{{ $tag }}>
