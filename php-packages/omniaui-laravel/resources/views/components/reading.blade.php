{{-- OmniaUI reading ("57 °C"). Props: level (cool|warm|hot). Slot = the value. --}}
@props(['level' => null])
<span {{ $attributes->class(['oc-reading', 'oc-reading--'.$level => $level && $level !== 'cool']) }}>{{ $slot }}</span>
