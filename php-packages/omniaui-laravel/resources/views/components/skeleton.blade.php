{{-- OmniaCSS skeleton. Props: shape (circle|title|text|rect). --}}
@props(['shape' => 'text'])
<div {{ $attributes->class(['oc-skeleton', 'oc-skeleton--'.$shape => $shape]) }}></div>
