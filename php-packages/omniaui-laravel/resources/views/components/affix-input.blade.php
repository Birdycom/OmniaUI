{{-- File: resources/views/components/affix-input.blade.php | Map: props -> variant presets -> group --affix (symbol + input)
     OmniaUI affix input. Props: variant (currency | percent | email), prefix, suffix (override the preset symbol), end (right-aligned digits), error.
     Attributes go to the input. --}}
@props(['variant' => null, 'prefix' => null, 'suffix' => null, 'end' => null, 'error' => false])
@php
    // Preset per variant: symbol, input attributes and alignment.
    $presets = [
        'currency' => ['prefix' => '€', 'end' => false, 'input' => ['type' => 'text', 'inputmode' => 'decimal']],
        'percent' => ['prefix' => '%', 'end' => false, 'input' => ['type' => 'text', 'inputmode' => 'decimal']],
        'email' => ['prefix' => '@', 'end' => false, 'input' => ['type' => 'email', 'autocomplete' => 'email']],
    ];
    $preset = $presets[$variant] ?? ['end' => false, 'input' => ['type' => 'text']];
    $before = $prefix ?? ($preset['prefix'] ?? null);
    $after = $suffix ?? ($preset['suffix'] ?? null);
    $alignEnd = $end ?? $preset['end'];
@endphp
<div @class(['oc-input-group', 'oc-input-group--affix', 'oc-input-group--end' => $alignEnd, 'oc-input-group--error' => $error])>
    @if ($before)
        <span class="oc-input-addon" aria-hidden="true">{{ $before }}</span>
    @endif
    <input {{ $attributes->class(['oc-input'])->merge(array_merge($preset['input'], ['aria-invalid' => $error ? 'true' : null])) }}>
    @if ($after)
        <span class="oc-input-addon" aria-hidden="true">{{ $after }}</span>
    @endif
</div>
