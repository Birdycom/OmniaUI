{{-- OmniaCSS breadcrumb. Props: items (list of ['label' => ..., 'href' => ...]; the last item is the current page), label.
     Without items the slot is rendered (use plain <a class="oc-breadcrumb-item">). --}}
@props(['items' => [], 'label' => 'Breadcrumb'])
<nav {{ $attributes->class(['oc-breadcrumb'])->merge(['aria-label' => $label]) }}>
    @forelse ($items as $i => $item)
        @php($item = is_array($item) ? $item : ['label' => $item])
        @if ($loop->last || empty($item['href']))
            <span class="oc-breadcrumb-item" @if ($loop->last) aria-current="page" @endif>{{ $item['label'] }}</span>
        @else
            <a class="oc-breadcrumb-item" href="{{ $item['href'] }}">{{ $item['label'] }}</a>
        @endif
    @empty
        {{ $slot }}
    @endforelse
</nav>
