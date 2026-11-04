{{-- OmniaUI step list: a compact numbered list of steps. Props: items (array of texts), size (sm). Slot = extra <li> elements. --}}
@props(['items' => [], 'size' => null])
<ol {{ $attributes->class(['oc-step-list', 'oc-step-list--sm' => $size === 'sm']) }}>
    @foreach ($items as $item)
        <li>{{ $item }}</li>
    @endforeach
    {{ $slot }}
</ol>
