{{-- File: resources/views/components/chart-line.blade.php | Map: props + demo data -> geometry (smooth paths, percentages) -> figure (head, y axis,
     plot: svg series + hover columns, x axis, legend)
     OmniaUI line / area chart in inline SVG; tooltips open on :hover and :focus-visible, no JavaScript. Props: title, sub, value,
     series (array of ['name' => …, 'values' => [...], 'dashed' => ?]), labels (one per point, tooltips), xLabels (short axis labels),
     max (default: a round number above the data), rows (gridlines, 4), variant (line|area|spark), dots, label (aria-label of the points). --}}
@props([
    'title' => 'Visitors', 'sub' => 'January – June 2026', 'value' => null,
    'series' => [['name' => 'Desktop', 'values' => [186, 305, 237, 73, 209, 214]], ['name' => 'Mobile', 'values' => [80, 200, 120, 190, 130, 140]]],
    'labels' => null, 'xLabels' => null, 'max' => null, 'rows' => 4, 'variant' => 'line', 'dots' => true, 'label' => 'Visitors per month',
])
@php
    $months = ['January', 'February', 'March', 'April', 'May', 'June'];
    $axis = $xLabels ?? $labels ?? array_map(fn ($m) => substr($m, 0, 3), $months);
    $labels ??= $months;
    // Number with at most 2 decimals and no trailing zeros ("75", "37.5", "4.69"); round() halves away from zero, like the snippet.
    $n2 = fn (float $n): string => rtrim(rtrim(number_format(round($n, 2), 2, '.', ''), '0'), '.') ?: '0';
    if ($max === null) {
        $raw = max(0, ...array_merge([0], ...array_map(fn ($s) => $s['values'], $series))) / $rows;
        $pow = $raw > 0 ? 10 ** floor(log10($raw)) : 1;
        $step = 10;
        foreach ([1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10] as $s) {
            if ($s * $pow >= $raw) { $step = $s; break; }
        }
        $max = $raw > 0 ? $step * $pow * $rows : $rows;
    }
    // Smooth path through the points; control points stay between their two ends (same geometry as the snippet).
    $path = function (array $values) use ($max, $n2): string {
        $count = count($values);
        $pts = array_map(fn ($v, $i) => [$count > 1 ? $i / ($count - 1) * 100 : 50, 100 - $v / $max * 100], $values, array_keys($values));
        if (! $pts) return '';
        $clamp = fn ($v, $a, $b) => min(max($v, min($a, $b)), max($a, $b));
        $d = 'M'.$n2($pts[0][0]).' '.$n2($pts[0][1]);
        for ($i = 0; $i < $count - 1; $i++) {
            [$p0, $p1, $p2, $p3] = [$pts[$i - 1] ?? $pts[$i], $pts[$i], $pts[$i + 1], $pts[$i + 2] ?? $pts[$i + 1]];
            $c1 = [$p1[0] + ($p2[0] - $p0[0]) / 6, $clamp($p1[1] + ($p2[1] - $p0[1]) / 6, $p1[1], $p2[1])];
            $c2 = [$p2[0] - ($p3[0] - $p1[0]) / 6, $clamp($p2[1] - ($p3[1] - $p1[1]) / 6, $p1[1], $p2[1])];
            $d .= ' C'.$n2($c1[0]).' '.$n2($c1[1]).' '.$n2($c2[0]).' '.$n2($c2[1]).' '.$n2($p2[0]).' '.$n2($p2[1]);
        }
        return $d;
    };
    $points = max(0, ...array_map(fn ($s) => count($s['values']), $series));
@endphp
<figure {{ $attributes->class(['oc-chart-line', 'oc-chart-line--'.$variant => $variant !== 'line', 'oc-chart-line--dots' => $dots]) }}>
    @if ($title || $sub || $value)
        <figcaption class="oc-chart-line__head">
            @if ($title)<span class="oc-chart-line__title">{{ $title }}</span>@endif
            @if ($sub)<span class="oc-chart-line__sub">{{ $sub }}</span>@endif
            @if ($value)<span class="oc-chart-line__value">{{ $value }}</span>@endif
        </figcaption>
    @endif
    <div class="oc-chart-line__body">
        <ul class="oc-chart-line__y" aria-hidden="true">@for ($i = 0; $i <= $rows; $i++)<li>{{ $n2($max - $max / $rows * $i) }}</li>@endfor</ul>
        <div class="oc-chart-line__plot"{!! $rows !== 4 ? ' style="--oc-chart-line-rows:'.(int) $rows.'"' : '' !!}>
            <svg class="oc-chart-line__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                @foreach ($series as $s)
                    @php($d = $path($s['values']))
                    <g class="oc-chart-line__series">
                        <path class="oc-chart-line__area" d="{{ $d }} L100 100 L0 100 Z"/>
                        <path @class(['oc-chart-line__path', 'oc-chart-line__path--dashed' => $s['dashed'] ?? false]) d="{{ $d }}"/>
                    </g>
                @endforeach
            </svg>
            <ul class="oc-chart-line__cols" style="--n:{{ $points }}" aria-label="{{ $label }}">
                @for ($i = 0; $i < $points; $i++)
                    <li class="oc-chart-line__col" style="--x:{{ $i }}" tabindex="0" aria-label="{{ $labels[$i] ?? $i + 1 }}: {{ implode(', ', array_map(fn ($s) => $s['name'].' '.($s['values'][$i] ?? ''), $series)) }}">@foreach ($series as $s)<i class="oc-chart-line__dot" style="--y:{{ $n2(($s['values'][$i] ?? 0) / $max * 100) }}%"></i>@endforeach<span class="oc-chart-line__tip" aria-hidden="true"><strong>{{ $labels[$i] ?? $i + 1 }}</strong>@foreach ($series as $s)<span class="oc-chart-line__row">{{ $s['name'] }}<b>{{ $s['values'][$i] ?? '' }}</b></span>@endforeach</span></li>
                @endfor
            </ul>
        </div>
        <ol class="oc-chart-line__x" aria-hidden="true">@foreach ($axis as $x)<li>{{ $x }}</li>@endforeach</ol>
    </div>
    <ul class="oc-chart-legend">@foreach ($series as $s)<li><span class="oc-chart-swatch"></span>{{ $s['name'] }}</li>@endforeach</ul>
</figure>
