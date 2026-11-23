{{-- OmniaCSS breadcrumb. Props: items (list of ['label' => ..., 'href' => ..., 'icon' => 'mdi:...']; the last item is the
     current page), label, separator (slash|chevron). Without items the slot is rendered: plain <a class="oc-breadcrumb-item">
     markup or the compound parts (0.18.0): <x-oc::breadcrumb.list>, .item, .link, .page, .separator, .ellipsis.
     max-items (0.18.0): a longer trail folds its middle into a "…" button with a menu of the hidden levels (a native popover);
     items-before (1) and items-after (2, the current page included) say how many levels stay; ellipsis-label ({count}). --}}
@props(['items' => [], 'label' => 'Breadcrumb', 'separator' => 'slash', 'maxItems' => null, 'itemsBefore' => 1, 'itemsAfter' => 2, 'ellipsisLabel' => null])
@php
    $items = array_values(array_map(fn ($item) => is_array($item) ? $item : ['label' => $item], $items));
    $count = count($items);
    $fold = $maxItems && $count > (int) $maxItems && ((int) $itemsBefore + (int) $itemsAfter) < $count;
    $hidden = $fold ? array_slice($items, (int) $itemsBefore, $count - (int) $itemsBefore - (int) $itemsAfter) : [];
@endphp
<nav {{ $attributes->class(['oc-breadcrumb', 'oc-breadcrumb--chevron' => $separator === 'chevron'])->merge(['aria-label' => $label]) }}>
    @forelse ($items as $i => $item)
        @if ($fold && $i === (int) $itemsBefore)
            <span class="oc-breadcrumb-item"><x-oc::breadcrumb.ellipsis :items="$hidden" :label="$ellipsisLabel" /></span>
        @endif
        @continue($fold && $i >= (int) $itemsBefore && $i < $count - (int) $itemsAfter)
        @if ($i === $count - 1 || empty($item['href']))
            <span class="oc-breadcrumb-item" @if ($i === $count - 1) aria-current="page" @endif>@if (! empty($item['icon']))<x-oc::webicon :name="$item['icon']" bare fallback="iconify" />@endif{{ $item['label'] }}</span>
        @else
            <a class="oc-breadcrumb-item" href="{{ $item['href'] }}">@if (! empty($item['icon']))<x-oc::webicon :name="$item['icon']" bare fallback="iconify" />@endif{{ $item['label'] }}</a>
        @endif
    @empty
        {{ $slot }}
    @endforelse
</nav>
