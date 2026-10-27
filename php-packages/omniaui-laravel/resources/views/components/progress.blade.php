{{-- OmniaCSS progress. Props: value, max (default 100), variant (success|warning|danger), label. --}}
@props(['value' => 0, 'max' => 100, 'variant' => null, 'label' => null])
@php($percent = $max > 0 ? max(0, min(100, round($value / $max * 100, 2))) : 0)
<div {{ $attributes->class(['oc-progress'])->merge(['role' => 'progressbar', 'aria-valuenow' => $value, 'aria-valuemin' => 0, 'aria-valuemax' => $max, 'aria-label' => $label]) }}>
    <div class="oc-progress-bar{{ $variant ? ' oc-progress-bar--'.$variant : '' }}" style="width: {{ $percent }}%"></div>
</div>
