{{-- OmniaUI rating (stars of a score). Props: value (e.g. 4.5), max (5), size (sm|md|lg), label (default "4.5 out of 5"). --}}
@props(['value' => 0, 'max' => 5, 'size' => 'md', 'label' => null])
@php
    $score = max(0, min((float) $max, (float) $value));
    $shown = rtrim(rtrim(number_format($score, 2, '.', ''), '0'), '.');
@endphp
<span {{ $attributes->class(['oc-rating', 'oc-rating--'.$size => $size !== 'md']) }} style="--oc-rating: {{ $shown }}@if ((int) $max !== 5); --oc-rating-max: {{ (int) $max }}@endif" role="img" aria-label="{{ $label ?? $shown.' out of '.(int) $max }}"></span>
