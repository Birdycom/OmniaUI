{{-- OmniaCSS toggle group. Props: label (aria-label), single (role=radiogroup; use <x-oc::toggle radio> inside), spaced. Slot: <x-oc::toggle> entries. --}}
@props(['label' => null, 'single' => false, 'spaced' => false])
<div {{ $attributes->class(['oc-toggle-group', 'oc-toggle-group--spaced' => $spaced])->merge(['role' => $single ? 'radiogroup' : 'group', 'aria-label' => $label]) }}>{{ $slot }}</div>
