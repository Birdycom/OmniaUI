{{-- OmniaCSS breadcrumb. Props: items (list of ['label' => ..., 'href' => ..., 'icon' => 'mdi:...']; the last item is the
     current page), label, separator (slash|chevron). Without items the slot is rendered (plain <a class="oc-breadcrumb-item">). --}}
@props(['items' => [], 'label' => 'Breadcrumb', 'separator' => 'slash'])
<nav {{ $attributes->class(['oc-breadcrumb', 'oc-breadcrumb--chevron' => $separator === 'chevron'])->merge(['aria-label' => $label]) }}>
    @forelse ($items as $i => $item)
        @php($item = is_array($item) ? $item : ['label' => $item])
        @if ($loop->last || empty($item['href']))
            <span class="oc-breadcrumb-item" @if ($loop->last) aria-current="page" @endif>@if (! empty($item['icon']))<x-oc::webicon :name="$item['icon']" bare fallback="iconify" />@endif{{ $item['label'] }}</span>
        @else
            <a class="oc-breadcrumb-item" href="{{ $item['href'] }}">@if (! empty($item['icon']))<x-oc::webicon :name="$item['icon']" bare fallback="iconify" />@endif{{ $item['label'] }}</a>
        @endif
    @empty
        {{ $slot }}
    @endforelse
</nav>
