{{-- OmniaCSS spinner. Props: size (sm|lg|xl), color (primary|muted), label (aria-label; pass :label="false" for a decorative spinner inside a busy button). --}}
@props(['size' => null, 'color' => null, 'label' => 'Loading'])
<span {{ $attributes->class(['oc-spinner', 'oc-spinner--'.$size => $size && $size !== 'md', 'oc-spinner--'.$color => $color])->merge($label === false ? ['aria-hidden' => 'true'] : ['role' => 'status', 'aria-label' => $label]) }}></span>
