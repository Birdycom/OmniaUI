{{-- OmniaCSS compound dialog description (0.17.0): p.oc-modal-description with id "{id}-description". --}}
@aware(['id' => 'oc-dialog'])
@props(['id' => 'oc-dialog'])
<p {{ $attributes->class(['oc-modal-description'])->merge(['id' => $id.'-description']) }}>{{ $slot }}</p>
