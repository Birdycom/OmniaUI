{{-- OmniaCSS toggle. Props: variant (outline), size (sm|lg), icon (square), radio (radio input for a single-choice group), button (a <button aria-pressed> instead of an input), pressed.
     Attributes (name, value, checked, wire:model, ...) go to the input (or button); `class` goes to the root. Slot: label or icon. --}}
@props(['variant' => null, 'size' => null, 'icon' => false, 'radio' => false, 'button' => false, 'pressed' => false])
@php
    $classes = ['oc-toggle', 'oc-toggle--'.$variant => $variant, 'oc-toggle--'.$size => $size && $size !== 'md', 'oc-toggle--icon' => $icon];
    $rootClass = \Illuminate\Support\Arr::toCssClasses($classes);
@endphp
@if ($button)
    <button {{ $attributes->class($classes)->merge(['type' => 'button', 'aria-pressed' => $pressed ? 'true' : 'false']) }}>{{ $slot }}</button>
@else
    <label class="{{ trim($rootClass.' '.$attributes->get('class')) }}">
        <input {{ $attributes->except('class')->merge(['type' => $radio ? 'radio' : 'checkbox']) }} @checked($pressed)>{{ $slot }}
    </label>
@endif
