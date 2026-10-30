{{-- OmniaCSS progress. Props: value, max (default 100), variant (success|warning|danger), label, size (xs|sm|md), glow,
     levels (true: warning from 70 %, danger from 90 %; or [warning, danger]; an explicit variant wins), marker (target, unit of value). --}}
@props(['value' => 0, 'max' => 100, 'variant' => null, 'label' => null, 'size' => 'md', 'glow' => false, 'levels' => false, 'marker' => null])
@php
    $pct = fn ($v) => $max > 0 ? max(0, min(100, $v / $max * 100)) : 0;
    $percent = round($pct($value), 2);
    $tone = $variant;
    if (! $tone && $levels) {
        [$warn, $danger] = is_array($levels) ? $levels : [70, 90];
        $tone = $percent >= $danger ? 'danger' : ($percent >= $warn ? 'warning' : null);
    }
@endphp
<div {{ $attributes->class(['oc-progress', 'oc-progress--'.$size => in_array($size, ['xs', 'sm'], true), 'oc-progress--glow' => $glow])->merge(['role' => 'progressbar', 'aria-valuenow' => $value, 'aria-valuemin' => 0, 'aria-valuemax' => $max, 'aria-label' => $label]) }}>
    <div class="oc-progress-bar{{ $tone ? ' oc-progress-bar--'.$tone : '' }}" style="width: {{ $percent }}%"></div>
    @if ($marker !== null)
        <span class="oc-progress-marker" style="left: {{ round($pct($marker), 2) }}%"></span>
    @endif
</div>
