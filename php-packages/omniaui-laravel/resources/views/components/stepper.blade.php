{{-- OmniaCSS stepper. Props: steps (list of strings or ['label', 'meta', 'state' => done|active|upcoming]), current (1-based active step; earlier = done), horizontal, label.
     Strings get an automatic "n/total" meta text. --}}
@props(['steps' => [], 'current' => 1, 'horizontal' => false, 'label' => null])
<ol {{ $attributes->class(['oc-stepper', 'oc-stepper--horizontal' => $horizontal])->merge(['aria-label' => $label]) }}>
    @foreach ($steps as $i => $step)
        @php
            $step = is_array($step) ? $step : ['label' => $step];
            $n = $i + 1;
            $state = $step['state'] ?? ($n < $current ? 'done' : ($n === (int) $current ? 'active' : 'upcoming'));
            $meta = $step['meta'] ?? $n.'/'.count($steps);
        @endphp
        <li>
            <button @class(['oc-stepper-item', 'oc-stepper-item--done' => $state === 'done', 'oc-stepper-item--active' => $state === 'active']) type="button" @if ($state === 'active') aria-current="step" @endif @if ($state === 'upcoming') disabled @endif><span><span class="oc-stepper-label">{{ $step['label'] }}</span><span class="oc-stepper-meta">{{ $meta }}</span></span></button>
        </li>
    @endforeach
</ol>
