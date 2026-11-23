{{-- OmniaCSS compound dialog trigger (0.17.0): <button command="show-modal" commandfor="{id}"> with the button classes.
     Props: variant (default|secondary|outline|ghost|destructive|..., default: default), size (sm|lg). With model on
     <x-oc::dialog> (Livewire) it runs $set('<model>', true) instead. Slot: the label. --}}
@aware(['id' => 'oc-dialog', 'model' => null])
@props(['variant' => 'default', 'size' => null, 'id' => 'oc-dialog', 'model' => null])
<button {{ $attributes->class(['oc-btn', 'oc-btn--'.$variant => $variant && $variant !== 'default', 'oc-btn--'.$size => $size])->merge(array_merge(
    ['type' => 'button', 'aria-haspopup' => 'dialog', 'aria-controls' => $id],
    $model
        ? ['wire:click' => '$set('.\Illuminate\Support\Js::from((string) $model).', true)']
        : ['command' => 'show-modal', 'commandfor' => $id],
)) }}>{{ $slot }}</button>
