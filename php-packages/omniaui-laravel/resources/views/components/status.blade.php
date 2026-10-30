{{-- File: resources/views/components/status.blade.php | Map: props -> p.oc-status -> status-dot + __text (slot) + __meta
     OmniaUI status row: dot + one line of state text that cuts off with … + optional meta on the right.
     Props: tone (working|waiting|done|error|idle), meta. Slot: the state in words. --}}
@props(['tone' => null, 'meta' => null])
<p {{ $attributes->class(['oc-status']) }}>
    <x-oc::status-dot :tone="$tone" />
    <span class="oc-status__text">{{ $slot }}</span>
    @if ($meta !== null)
        <span class="oc-status__meta">{{ $meta }}</span>
    @endif
</p>
