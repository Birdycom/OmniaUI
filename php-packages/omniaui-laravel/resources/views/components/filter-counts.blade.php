{{-- File: resources/views/components/filter-counts.blade.php | Map: props -> fieldset radiogroup -> tile per view (radio + value + label + hint)
     OmniaUI filter counts. Props: name (required), options (list of ['value', 'label', 'count', 'hint'?, 'tone'? success|destructive|muted]),
     value (selected), label (aria-label), compact. Attributes go to the fieldset. --}}
@props(['name', 'options' => [], 'value' => null, 'label' => null, 'compact' => false])
<fieldset {{ $attributes->class(['oc-filter-counts', 'oc-filter-counts--compact' => $compact])->merge(['role' => 'radiogroup', 'aria-label' => $label]) }}>
    @foreach ($options as $option)
        <label @class(['oc-filter-counts-item', 'oc-filter-counts-item--'.($option['tone'] ?? '') => ! empty($option['tone']) && $option['tone'] !== 'primary'])>
            <input type="radio" name="{{ $name }}" value="{{ $option['value'] }}" @checked((string) $value === (string) $option['value'])>
            <span class="oc-filter-counts-value">{{ $option['count'] }}</span>
            <span class="oc-filter-counts-label">{{ $option['label'] }}</span>
            @if (! empty($option['hint']))
                <span class="oc-filter-counts-hint">{{ $option['hint'] }}</span>
            @endif
        </label>
    @endforeach
    {{ $slot }}
</fieldset>
