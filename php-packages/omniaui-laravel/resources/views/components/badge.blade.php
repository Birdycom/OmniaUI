{{-- OmniaCSS badge. Props: variant (default|secondary|outline|destructive|success|warning|info). Slot: text. --}}
@props(['variant' => 'default'])
<span {{ $attributes->class(['oc-badge', 'oc-badge--'.$variant => ! in_array($variant, ['default', 'primary', null, ''], true)]) }}>{{ $slot }}</span>
