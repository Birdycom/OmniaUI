{{-- OmniaCSS scroll area. Props: x (horizontal), shadows (edge shadows, default on for vertical), label (aria-label),
     bare (0.18.0: only the scrolling and the themed scrollbar, no padding, frame or height cap; shadows then default off). Slot: content. --}}
@props(['x' => false, 'shadows' => null, 'bare' => false, 'label' => null])
<div {{ $attributes->class(['oc-scroll-area', 'oc-scroll-area--x' => $x, 'oc-scroll-area--shadows' => $shadows ?? (! $x && ! $bare), 'oc-scroll-area--bare' => $bare])->merge(['tabindex' => '0', 'role' => 'region', 'aria-label' => $label]) }}>{{ $slot }}</div>
