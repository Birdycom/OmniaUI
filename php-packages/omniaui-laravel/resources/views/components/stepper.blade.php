{{-- OmniaCSS stepper. Props: steps (list of strings or ['label', 'meta', 'state' => done|active|upcoming]), current (1-based active step; earlier = done), horizontal, label.
     Strings get an automatic "n/total" meta text.
     Click hook: action (Livewire method; a done or active step gets wire:click="{action}({n})" with its 1-based number), or per step
     'attributes' (extra attributes for its button, e.g. ['wire:click' => "goTo('address')"] or ['onclick' => '...']).
     0.18.0: per step 'enabled' (true/false) overrides which steps can be clicked (default: done and active ones). --}}
@props(['steps' => [], 'current' => 1, 'horizontal' => false, 'label' => null, 'action' => null])
<ol {{ $attributes->class(['oc-stepper', 'oc-stepper--horizontal' => $horizontal])->merge(['aria-label' => $label]) }}>
    @foreach ($steps as $i => $step)
        @php
            $step = is_array($step) ? $step : ['label' => $step];
            $n = $i + 1;
            $state = $step['state'] ?? ($n < $current ? 'done' : ($n === (int) $current ? 'active' : 'upcoming'));
            $meta = $step['meta'] ?? $n.'/'.count($steps);
            $enabled = array_key_exists('enabled', $step) ? (bool) $step['enabled'] : $state !== 'upcoming';
            $stepBag = (new \Illuminate\View\ComponentAttributeBag((array) ($step['attributes'] ?? [])))
                ->merge($action && $enabled ? ['wire:click' => $action.'('.$n.')'] : [])
                ->class(['oc-stepper-item', 'oc-stepper-item--done' => $state === 'done', 'oc-stepper-item--active' => $state === 'active']);
        @endphp
        <li>
            <button {{ $stepBag }} type="button" @if ($state === 'active') aria-current="step" @endif @unless ($enabled) disabled @endunless><span><span class="oc-stepper-label">{{ $step['label'] }}</span><span class="oc-stepper-meta">{{ $meta }}</span></span></button>
        </li>
    @endforeach
</ol>
