{{-- File: resources/views/components/color-select.blade.php | Map: props -> fieldset radiogroup -> label per color (radio + swatch + name)
     OmniaUI color select. Props: name (required), options (value => [label, css color], value => [label, css color, disabled, title],
     or value => ['label', 'color', 'disabled', 'title']), value (selected), disabled (list of values that cannot be chosen),
     label (aria-label), list, size (sm). Give a disabled color a title such as "Purple, in use".
     Colors: Omnia tokens only, e.g. 'var(--color-red-70)'. Attributes go to the fieldset. --}}
@props(['name', 'options' => [], 'value' => null, 'disabled' => [], 'label' => null, 'list' => false, 'size' => null])
@php
    $off = array_map('strval', (array) $disabled);
@endphp
<fieldset {{ $attributes->class(['oc-color-select', 'oc-color-select--list' => $list, 'oc-color-select--sm' => $size === 'sm'])->merge(['role' => 'radiogroup', 'aria-label' => $label]) }}>
    @foreach ($options as $optionValue => $option)
        @php
            $optionLabel = $option['label'] ?? $option[0];
            $optionColor = $option['color'] ?? $option[1];
            $optionOff = ! empty($option['disabled'] ?? $option[2] ?? false) || in_array((string) $optionValue, $off, true);
            $optionTitle = $option['title'] ?? $option[3] ?? null;
        @endphp
        <label class="oc-color-select-option" style="--oc-swatch: {{ $optionColor }}" @if ($optionTitle) title="{{ $optionTitle }}" @endif><input type="radio" name="{{ $name }}" value="{{ $optionValue }}" @checked((string) $value === (string) $optionValue) @disabled($optionOff)><span class="oc-color-select-swatch"></span><span class="oc-color-select-name">{{ $optionLabel }}</span></label>
    @endforeach
    {{ $slot }}
</fieldset>
