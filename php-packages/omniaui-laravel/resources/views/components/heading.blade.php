{{-- OmniaCSS heading. Props: title, description, size (sm), level (1-6, default 2). Slot: title when no title prop. --}}
@props(['title' => null, 'description' => null, 'size' => null, 'level' => 2])
<div {{ $attributes->class(['oc-heading', 'oc-heading--'.$size => $size]) }}>
    <h{{ $level }} class="oc-heading-title">{{ $title ?? $slot }}</h{{ $level }}>
    @if ($description)
        <p class="oc-heading-description">{{ $description }}</p>
    @endif
</div>
