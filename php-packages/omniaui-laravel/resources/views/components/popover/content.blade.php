{{-- OmniaCSS compound popover content (0.17.0): <div class="oc-popover" popover> with the id of <x-oc::popover>.
     Props: side (top|right|bottom|left, default bottom), align (start|center|end, default start), offset (px), size (sm|lg),
     title, text, match-trigger-width (0.18.0: as wide as the trigger, data-match-width + CSS anchor-size). Livewire: with
     model on <x-oc::popover> the open state is entangled with that property. Slot: panel content. --}}
@aware(['id' => 'oc-popover', 'model' => null])
@props(['side' => 'bottom', 'align' => 'start', 'offset' => null, 'size' => null, 'title' => null, 'text' => null, 'id' => 'oc-popover', 'model' => null, 'matchTriggerWidth' => false])
<div {{ $attributes->class(['oc-popover', 'oc-popover--'.$size => $size])->merge(['id' => $id, 'role' => 'dialog', 'data-side' => $side, 'data-align' => $align, 'style' => $offset !== null ? '--oc-popover-offset: '.(int) $offset.'px' : null]) }} popover data-oc-popover-part @if ($matchTriggerWidth) data-match-width @endif
    @if ($model)
        wire:ignore.self
        x-data="{ open: $wire.entangle({{ \Illuminate\Support\Js::from((string) $model) }}) }"
        x-effect="open ? ($el.matches(':popover-open') || $el.showPopover()) : ($el.matches(':popover-open') && $el.hidePopover())"
        x-on:toggle="open = $event.newState === 'open'"
    @endif
>
    @if ($title)
        <h3 class="oc-popover-title">{{ $title }}</h3>
    @endif
    @if ($text)
        <p class="oc-popover-text">{{ $text }}</p>
    @endif
    {{ $slot }}
</div>
