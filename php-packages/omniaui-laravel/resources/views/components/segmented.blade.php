{{-- OmniaCSS segmented control (radio group). Props: name (required), options (value => label), value (selected), label (aria-label), size (sm), block.
     Slot: replaces the generated options with raw <label class="oc-segmented-item"> entries. Attributes go to the wrapper. --}}
@props(['name', 'options' => [], 'value' => null, 'label' => null, 'size' => null, 'block' => false])
<div {{ $attributes->class(['oc-segmented', 'oc-segmented--sm' => $size === 'sm', 'oc-segmented--block' => $block])->merge(['role' => 'radiogroup', 'aria-label' => $label]) }}>
    @foreach ($options as $optionValue => $optionLabel)
        <label class="oc-segmented-item"><input type="radio" name="{{ $name }}" value="{{ $optionValue }}" @checked((string) $value === (string) $optionValue)> {{ $optionLabel }}</label>
    @endforeach
    {{ $slot }}
</div>
