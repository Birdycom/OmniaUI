{{-- OmniaCSS label. Props: required (asterisk), inline (wraps a checkbox/radio), muted. Attributes (for, ...) go to the label. --}}
@props(['required' => false, 'inline' => false, 'muted' => false])
<label {{ $attributes->class(['oc-label', 'oc-label--required' => $required, 'oc-label--inline' => $inline, 'oc-label--muted' => $muted]) }}>{{ $slot }}</label>
