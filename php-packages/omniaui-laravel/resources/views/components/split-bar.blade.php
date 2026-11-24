{{-- File: resources/views/components/split-bar.blade.php | Map: props -> x-oc::progress with segments -> optional legend
     OmniaUI split bar (0.18.0): right / wrong, done / open. Props: segments ([['value' => 12, 'tone' => 'success', 'label' => 'Right'], ...];
     tones default|success|warning|danger|info|muted), max (total, default the sum), size (xs|sm|md), track (striped), label, legend. --}}
@props(['segments' => [], 'max' => null, 'size' => 'md', 'track' => 'plain', 'label' => null, 'legend' => false])
@if ($legend)
<div {{ $attributes }}>
    <x-oc::progress :segments="$segments" :max="$max" :size="$size" :track="$track" :label="$label" />
    <ul class="oc-progress-legend">
        @foreach (array_values($segments) as $i => $p)
            @php $tone = $p['tone'] ?? 'default'; @endphp
            <li @class(['oc-progress-segment--'.$tone => $tone !== 'default'])>{{ $p['label'] ?? 'Part '.($i + 1) }} {{ $p['value'] ?? 0 }}</li>
        @endforeach
    </ul>
</div>
@else
<x-oc::progress {{ $attributes }} :segments="$segments" :max="$max" :size="$size" :track="$track" :label="$label" />
@endif
