{{-- File: resources/views/components/flip-card.blade.php | Map: props -> card -> checkbox (toggle) -> inner -> front / back faces
     OmniaUI flip card, CSS only. Props: id (checkbox id), trigger (toggle|hover|manual, default toggle), flipped,
     vertical, frontLabel, backLabel. Slots: front, back. --}}
@props(['id' => null, 'trigger' => 'toggle', 'flipped' => false, 'vertical' => false, 'frontLabel' => 'Show answer', 'backLabel' => 'Back'])
@php
    $id = $id ?: 'oc-flip-'.substr(md5(uniqid('', true)), 0, 6);
    $toggle = $trigger === 'toggle';
@endphp
<div {{ $attributes->class([
    'oc-flip-card',
    'oc-flip-card--hover' => $trigger === 'hover',
    'oc-flip-card--vertical' => $vertical,
    'is-flipped' => ! $toggle && $flipped,
])->merge($trigger === 'hover' ? ['tabindex' => '0'] : []) }}>
    @if ($toggle)
        <input type="checkbox" class="oc-flip-card__toggle" id="{{ $id }}" @checked($flipped)>
    @endif
    <div class="oc-flip-card__inner">
        <div class="oc-flip-card__face oc-flip-card__face--front">
            {{ $front ?? '' }}
            @if ($toggle)
                <label class="oc-flip-card__flip" for="{{ $id }}">{{ $frontLabel }}</label>
            @endif
        </div>
        <div class="oc-flip-card__face oc-flip-card__face--back">
            {{ $back ?? '' }}
            @if ($toggle)
                <label class="oc-flip-card__flip" for="{{ $id }}">{{ $backLabel }}</label>
            @endif
        </div>
    </div>
</div>
