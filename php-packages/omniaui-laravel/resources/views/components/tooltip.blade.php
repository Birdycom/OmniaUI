{{-- OmniaCSS tooltip (CSS only). Props: text. Slot: the element that gets the tooltip. --}}
@props(['text'])
<span {{ $attributes->class(['oc-tooltip'])->merge(['data-tooltip' => $text]) }}>{{ $slot }}</span>
