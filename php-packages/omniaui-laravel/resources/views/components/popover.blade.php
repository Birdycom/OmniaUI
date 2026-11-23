{{-- OmniaCSS popover. Props: id, title, text, size (sm|lg), trigger (button label), variant (trigger button variant).
     Slots: default = panel content, trigger (replaces the button).
     Compound (0.17.0): put <x-oc::popover.trigger> and <x-oc::popover.content> in the slot (give the root an id); model =
     a Livewire boolean property for the open state (Alpine $wire.entangle on the panel). --}}
@props(['id' => null, 'title' => null, 'text' => null, 'size' => null, 'trigger' => 'Open', 'variant' => 'outline', 'model' => null])
@if (str_contains((string) $slot, 'data-oc-popover-part'))
{{ $slot }}
@else
@php($id = $id ?: 'oc-popover-'.substr(md5(uniqid('', true)), 0, 6))
<button class="oc-btn oc-btn--{{ $variant }}" type="button" popovertarget="{{ $id }}">{{ $trigger }}</button>
<div {{ $attributes->class(['oc-popover', 'oc-popover--'.$size => $size])->merge(['id' => $id]) }} popover>
    @if ($title)
        <h3 class="oc-popover-title">{{ $title }}</h3>
    @endif
    @if ($text)
        <p class="oc-popover-text">{{ $text }}</p>
    @endif
    {{ $slot }}
</div>
@endif
