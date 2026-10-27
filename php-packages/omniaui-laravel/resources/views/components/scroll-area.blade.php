{{-- OmniaCSS scroll area. Props: x (horizontal), shadows (edge shadows, default on for vertical), label (aria-label). Slot: content. --}}
@props(['x' => false, 'shadows' => null, 'label' => null])
<div {{ $attributes->class(['oc-scroll-area', 'oc-scroll-area--x' => $x, 'oc-scroll-area--shadows' => $shadows ?? ! $x])->merge(['tabindex' => '0', 'role' => 'region', 'aria-label' => $label]) }}>{{ $slot }}</div>
