{{-- OmniaCSS button group. Props: vertical, label (aria-label). Slot: <x-oc::button> entries and optional .oc-btn-group-text cells. --}}
@props(['vertical' => false, 'label' => null])
<div {{ $attributes->class(['oc-btn-group', 'oc-btn-group--vertical' => $vertical])->merge(['role' => 'group', 'aria-label' => $label]) }}>{{ $slot }}</div>
