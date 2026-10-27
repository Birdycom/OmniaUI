{{-- OmniaCSS avatar. Props: size (sm|lg|xl), src, alt. Slot: initials (when no src). --}}
@props(['size' => null, 'src' => null, 'alt' => ''])
<span {{ $attributes->class(['oc-avatar', 'oc-avatar--'.$size => $size]) }}>
    @if ($src)
        <img src="{{ $src }}" alt="{{ $alt }}">
    @else
        {{ $slot }}
    @endif
</span>
