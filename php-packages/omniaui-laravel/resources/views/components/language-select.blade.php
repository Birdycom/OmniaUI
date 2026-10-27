{{-- File: resources/views/components/language-select.blade.php | Map: props -> label pill -> icon (globe or symbol) -> native select
     OmniaUI language / currency switcher. Props: options (value => label), value (selected), label (aria-label), currency, ghost, icon (text symbol).
     Attributes (name, onchange, wire:model...) go to the select. --}}
@props(['options' => [], 'value' => null, 'label' => null, 'currency' => false, 'ghost' => false, 'icon' => null])
<label @class(['oc-language-select', 'oc-language-select--ghost' => $ghost, 'oc-language-select--currency' => $currency])>
    <span class="oc-language-select-icon" aria-hidden="true">
        @if ($icon || $currency)
            {{ $icon ?? '€' }}
        @else
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
        @endif
    </span>
    <select {{ $attributes->class(['oc-language-select-control'])->merge(['aria-label' => $label ?? ($currency ? 'Currency' : 'Language')]) }}>
        @foreach ($options as $optionValue => $optionLabel)
            <option value="{{ $optionValue }}" @selected((string) $value === (string) $optionValue)>{{ $optionLabel }}</option>
        @endforeach
    </select>
</label>
