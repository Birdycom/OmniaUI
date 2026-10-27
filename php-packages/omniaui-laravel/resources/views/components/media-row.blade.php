{{-- File: resources/views/components/media-row.blade.php | Map: props -> li row -> media thumb -> title link + meta -> menu button + popover
     OmniaUI media row. Put rows in <ul class="oc-media-row-list"> or <ol class="oc-media-row-list oc-media-row-list--numbered">.
     Props: title, href (link covers the row), meta, thumb (array of <x-oc::media-thumb> props), current (aria-current), id (menu id).
     Slot: menu (dropdown items; shows the ⋮ button). --}}
@props(['title', 'href' => '#', 'meta' => null, 'thumb' => [], 'current' => false, 'id' => null])
@php
    $menuId = ($id ?: 'oc-media-row-'.substr(md5(uniqid('', true)), 0, 6)).'-menu';
    $hasMenu = isset($menu) && trim((string) $menu) !== '';
@endphp
<li {{ $attributes->class(['oc-media-row'])->merge($current ? ['aria-current' => 'true'] : []) }}>
    <x-oc::media-thumb :src="$thumb['src'] ?? null" :alt="$thumb['alt'] ?? ''" :art="$thumb['art'] ?? null" :duration="$thumb['duration'] ?? null"
        :badge="$thumb['badge'] ?? null" :live="$thumb['live'] ?? false" :progress="$thumb['progress'] ?? null" :watched="$thumb['watched'] ?? false" />
    <div class="oc-media-row__text">
        <h3 class="oc-media-row__title"><a href="{{ $href }}">{{ $title }}</a></h3>
        @if ($meta)
            <p class="oc-media-row__meta">{{ $meta }}</p>
        @endif
    </div>
    @if ($hasMenu)
        <button type="button" class="oc-media-row__menu" popovertarget="{{ $menuId }}" aria-label="More actions">&#8942;</button>
        <div class="oc-dropdown-menu" id="{{ $menuId }}" popover>{{ $menu }}</div>
    @endif
</li>
