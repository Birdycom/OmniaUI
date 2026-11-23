{{-- OmniaCSS compound dialog content (0.17.0): the <dialog class="oc-modal"> with id from <x-oc::dialog>.
     Props: size (sm|lg|xl|full), closedby (any|closerequest|none, default any), close-button (× in the corner, default
     true), close (its aria-label), close-round, scroll (header and footer stay, .body scrolls).
     Livewire: with model on <x-oc::dialog> the open state is entangled with that property (wire:ignore.self + Alpine).
     Slot: <x-oc::dialog.header>, <x-oc::dialog.body>, <x-oc::dialog.footer> or your own markup. --}}
@aware(['id' => 'oc-dialog', 'model' => null])
@props(['size' => null, 'closedby' => 'any', 'closeButton' => true, 'close' => 'Close', 'closeRound' => false, 'scroll' => false, 'id' => 'oc-dialog', 'model' => null])
<dialog {{ $attributes->class(['oc-modal'])->merge(['id' => $id, 'closedby' => $closedby, 'aria-labelledby' => $id.'-title', 'aria-describedby' => $id.'-description']) }}
    @if ($model)
        wire:ignore.self
        x-data="{ open: $wire.entangle({{ \Illuminate\Support\Js::from((string) $model) }}) }"
        x-effect="open ? ($el.open || $el.showModal()) : ($el.open && $el.close())"
        x-on:close="open = false"
    @endif
>
    <div @class(['oc-modal-content', 'oc-modal-content--'.$size => $size, 'oc-modal-content--scroll' => $scroll])>
        @if ($closeButton)
            <button @class(['oc-modal-close', 'oc-close--round' => $closeRound]) type="button" command="close" commandfor="{{ $id }}" aria-label="{{ $close }}">&times;</button>
        @endif
        {{ $slot }}
    </div>
</dialog>
