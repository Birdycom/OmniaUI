{{-- OmniaCSS compound dialog close button (0.17.0): <button command="close" commandfor="{id}"> with the button classes.
     Props: variant (default: outline), size (sm|lg). Slot: the label. --}}
@aware(['id' => 'oc-dialog'])
@props(['variant' => 'outline', 'size' => null, 'id' => 'oc-dialog'])
<button {{ $attributes->class(['oc-btn', 'oc-btn--'.$variant => $variant && $variant !== 'default', 'oc-btn--'.$size => $size])->merge(['type' => 'button', 'command' => 'close', 'commandfor' => $id]) }}>{{ $slot }}</button>
