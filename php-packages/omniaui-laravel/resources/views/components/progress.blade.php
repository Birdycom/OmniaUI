{{-- OmniaCSS progress. Props: value, max (default 100), variant (success|warning|danger), label, size (xs|sm|md), glow,
     levels (true: warning from 70 %, danger from 90 %; or [warning, danger]; an explicit variant wins), marker (target, unit of value),
     track (0.18.0: striped = flat stripes on the part still to do), segments (0.18.0: [['value' => 12, 'tone' => 'success', 'label' => 'Right'], ...]
     makes a split bar .oc-progress--split; max is then the total, default the sum). --}}
@props(['value' => 0, 'max' => null, 'variant' => null, 'label' => null, 'size' => 'md', 'glow' => false, 'levels' => false, 'marker' => null, 'track' => 'plain', 'segments' => null])
@php
    $total = $max ?? 100;
    $pct = fn ($v) => $total > 0 ? max(0, min(100, $v / $total * 100)) : 0;
    $percent = round($pct($value), 2);
    $tone = $variant;
    if (! $tone && $levels) {
        [$warn, $danger] = is_array($levels) ? $levels : [70, 90];
        $tone = $percent >= $danger ? 'danger' : ($percent >= $warn ? 'warning' : null);
    }
@endphp
@if (is_array($segments))
@php
    $sum = array_sum(array_map(fn ($p) => max(0, (float) ($p['value'] ?? 0)), $segments));
    $splitTotal = $max !== null && $max > 0 ? $max : $sum;
    $splitLabel = $label ?? implode(', ', array_map(fn ($p, $i) => ($p['label'] ?? 'Part '.($i + 1)).' '.($p['value'] ?? 0), array_values($segments), array_keys(array_values($segments))));
@endphp
<div {{ $attributes->class(['oc-progress', 'oc-progress--split', 'oc-progress--'.$size => in_array($size, ['xs', 'sm'], true), 'oc-progress--striped' => $track === 'striped'])->merge(['role' => 'img', 'aria-label' => $splitLabel]) }}>
    @foreach (array_values($segments) as $p)
        @php $tone = $p['tone'] ?? 'default'; @endphp
        <span @class(['oc-progress-segment', 'oc-progress-segment--'.$tone => $tone !== 'default']) style="inline-size: {{ $splitTotal > 0 ? round(max(0, (float) ($p['value'] ?? 0)) / $splitTotal * 100, 2) : 0 }}%" @if (! empty($p['label'])) title="{{ $p['label'] }}: {{ $p['value'] ?? 0 }}" @endif></span>
    @endforeach
</div>
@else
<div {{ $attributes->class(['oc-progress', 'oc-progress--'.$size => in_array($size, ['xs', 'sm'], true), 'oc-progress--glow' => $glow, 'oc-progress--striped' => $track === 'striped'])->merge(['role' => 'progressbar', 'aria-valuenow' => $value, 'aria-valuemin' => 0, 'aria-valuemax' => $total, 'aria-label' => $label]) }}>
    <div class="oc-progress-bar{{ $tone ? ' oc-progress-bar--'.$tone : '' }}" style="width: {{ $percent }}%"></div>
    @if ($marker !== null)
        <span class="oc-progress-marker" style="left: {{ round($pct($marker), 2) }}%"></span>
    @endif
</div>
@endif
