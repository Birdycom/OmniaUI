{{-- File: resources/views/components/media-card.blade.php | Map: props -> article -> media thumb -> body (avatar, title + meta, menu) -> popover menu
     OmniaUI media card. Props: title, href (title link covers the card), meta, avatar (initials), thumb (array of
     <x-oc::media-thumb> props: src, art, duration, progress, …), compact, id (menu id). Slots: avatar, menu (dropdown items). --}}
@props(['title', 'href' => '#', 'meta' => null, 'avatar' => null, 'thumb' => [], 'compact' => false, 'id' => null])
@php
    $menuId = ($id ?: 'oc-media-card-'.substr(md5(uniqid('', true)), 0, 6)).'-menu';
    $hasMenu = isset($menu) && trim((string) $menu) !== '';
@endphp
<article {{ $attributes->class(['oc-media-card', 'oc-media-card--compact' => $compact]) }}>
    <x-oc::media-thumb :src="$thumb['src'] ?? null" :alt="$thumb['alt'] ?? ''" :art="$thumb['art'] ?? null" :duration="$thumb['duration'] ?? null"
        :badge="$thumb['badge'] ?? null" :live="$thumb['live'] ?? false" :progress="$thumb['progress'] ?? null" :watched="$thumb['watched'] ?? false" />
    <div class="oc-media-card__body">
        @if (isset($avatar) && trim((string) $avatar) !== '')
            <span class="oc-media-card__avatar" aria-hidden="true">{{ $avatar }}</span>
        @endif
        <div class="oc-media-card__text">
            <h3 class="oc-media-card__title"><a href="{{ $href }}">{{ $title }}</a></h3>
            @if ($meta)
                <p class="oc-media-card__meta">{{ $meta }}</p>
            @endif
        </div>
        @if ($hasMenu)
            <button type="button" class="oc-media-card__menu" popovertarget="{{ $menuId }}" aria-label="More actions">&#8942;</button>
        @endif
    </div>
    @if ($hasMenu)
        <div class="oc-dropdown-menu" id="{{ $menuId }}" popover>{{ $menu }}</div>
    @endif
</article>
