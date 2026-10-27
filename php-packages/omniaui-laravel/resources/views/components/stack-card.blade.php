{{-- File: resources/views/components/stack-card.blade.php | Map: props -> article -> deck (media thumb cover + count) -> title link + meta
     OmniaUI stack card (playlist / course cover as a stacked deck). Props: title, href (link covers the card), meta,
     count ("12 videos"), panel (count as side panel), thumb (array of <x-oc::media-thumb> props). --}}
@props(['title', 'href' => '#', 'meta' => null, 'count' => null, 'panel' => false, 'thumb' => []])
<article {{ $attributes->class(['oc-stack-card', 'oc-stack-card--panel' => $panel]) }}>
    <div class="oc-stack-card__deck">
        <x-oc::media-thumb :src="$thumb['src'] ?? null" :alt="$thumb['alt'] ?? ''" :art="$thumb['art'] ?? null" :badge="$thumb['badge'] ?? null" />
        @if ($count)
            <span class="oc-stack-card__count">{{ $count }}</span>
        @endif
    </div>
    <div>
        <h3 class="oc-stack-card__title"><a href="{{ $href }}">{{ $title }}</a></h3>
        @if ($meta)
            <p class="oc-stack-card__meta">{{ $meta }}</p>
        @endif
    </div>
</article>
