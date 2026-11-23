{{-- OmniaCSS compound dialog (0.17.0): root that gives its parts one id. Props: id (required: the <dialog> id), model
     (Livewire: a boolean property that holds the open state; the trigger then $sets it and the dialog follows it with Alpine
     $wire.entangle, as <x-oc::wire.modal>). Slot: <x-oc::dialog.trigger>, <x-oc::dialog.content> (with .header, .title,
     .description, .body, .footer, .close). Works without JavaScript: buttons use command="show-modal|close" commandfor. Renders a .oc-dialog wrapper with
     display: contents (other attributes land on it). --}}
@props(['id' => 'oc-dialog', 'model' => null])
<div {{ $attributes->class(['oc-dialog']) }}>{{ $slot }}</div>
