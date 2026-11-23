{{-- OmniaCSS compound popover trigger (0.17.0): <button popovertarget="{id}"> with the button classes (the implicit anchor).
     Props: variant (default: outline), size (sm|lg). Slot: the label. --}}
@aware(['id' => 'oc-popover'])
@props(['variant' => 'outline', 'size' => null, 'id' => 'oc-popover'])
<button {{ $attributes->class(['oc-btn', 'oc-btn--'.$variant => $variant && $variant !== 'default', 'oc-btn--'.$size => $size])->merge(['type' => 'button', 'popovertarget' => $id, 'aria-controls' => $id, 'aria-haspopup' => 'dialog']) }} data-oc-popover-part>{{ $slot }}</button>
