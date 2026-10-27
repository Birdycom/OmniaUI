{{-- OmniaCSS counter. Props: to (number), suffix, onView (start when scrolled into view). --}}
@props(['to' => 0, 'suffix' => '', 'onView' => true])
<strong {{ $attributes->class(['oc-counter', 'oc-counter--on-view' => $onView])->merge(['style' => '--oc-counter-to: '.(float) $to.';'.($suffix !== '' ? " --oc-counter-suffix: '".addslashes($suffix)."'" : '')]) }}></strong>
