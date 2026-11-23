{{-- OmniaCSS compound dialog title (0.17.0): h2.oc-modal-title with id "{id}-title" (the accessible name of the dialog). --}}
@aware(['id' => 'oc-dialog'])
@props(['id' => 'oc-dialog'])
<h2 {{ $attributes->class(['oc-modal-title'])->merge(['id' => $id.'-title']) }}>{{ $slot }}</h2>
