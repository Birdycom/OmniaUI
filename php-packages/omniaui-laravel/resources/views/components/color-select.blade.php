{{-- File: resources/views/components/color-select.blade.php | Map: props -> fieldset radiogroup -> label per color (radio + swatch + name)
     OmniaUI color select. Props: name (required), options (value => [label, css color]), value (selected), label (aria-label), list, size (sm).
     Colors: Omnia tokens only, e.g. 'var(--color-red-70)'. Attributes go to the fieldset. --}}
@props(['name', 'options' => [], 'value' => null, 'label' => null, 'list' => false, 'size' => null])
<fieldset {{ $attributes->class(['oc-color-select', 'oc-color-select--list' => $list, 'oc-color-select--sm' => $size === 'sm'])->merge(['role' => 'radiogroup', 'aria-label' => $label]) }}>
    @foreach ($options as $optionValue => [$optionLabel, $optionColor])
        <label class="oc-color-select-option" style="--oc-swatch: {{ $optionColor }}"><input type="radio" name="{{ $name }}" value="{{ $optionValue }}" @checked((string) $value === (string) $optionValue)><span class="oc-color-select-swatch"></span><span class="oc-color-select-name">{{ $optionLabel }}</span></label>
    @endforeach
    {{ $slot }}
</fieldset>
