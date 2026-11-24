{{-- File: resources/views/components/meter-list.blade.php | Map: variant + live -> list classes -> slot with <x-oc::meter-row>
     OmniaUI meter list: stack of meter rows. Needs @birdycom/omniaui CSS.
     Props: variant (compact: tighter list and thinner bar | dense: small widget or tray window, no transition |
     live: no width transition), live (adds --live next to another variant, e.g. compact + live).
     Slot: <x-oc::meter-row> entries. --}}
@props(['variant' => null, 'live' => false])
<div {{ $attributes->class(['oc-meter-list', 'oc-meter-list--'.$variant => $variant && $variant !== 'live', 'oc-meter-list--live' => $live || $variant === 'live']) }}>{{ $slot }}</div>
