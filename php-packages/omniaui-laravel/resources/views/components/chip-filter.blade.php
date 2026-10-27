{{-- File: resources/views/components/chip-filter.blade.php | Map: props -> group -> chip label per option (checkbox / radio + text + count)
     OmniaUI chip filter. Props: name (required), options (value => label, or value => [label, count]), value (string, or array with multiple),
     multiple (checkboxes, name gets []), label (aria-label), size (sm), scroll. Attributes go to the group. --}}
@props(['name', 'options' => [], 'value' => null, 'multiple' => false, 'label' => null, 'size' => null, 'scroll' => false])
@php
    // Inline @php(...) and @php blocks can't be mixed in one file, so blocks only here.
    $selected = array_map('strval', (array) $value);
@endphp
<div {{ $attributes->class(['oc-chip-filter', 'oc-chip-filter--sm' => $size === 'sm', 'oc-chip-filter--scroll' => $scroll])->merge(['role' => $multiple ? 'group' : 'radiogroup', 'aria-label' => $label]) }}>
    @foreach ($options as $optionValue => $option)
        @php
            // An option is "Label" or ["Label", count].
            $optionLabel = is_array($option) ? $option[0] : $option;
            $optionCount = is_array($option) ? ($option[1] ?? null) : null;
        @endphp
        <label class="oc-chip-filter-item">
            <input type="{{ $multiple ? 'checkbox' : 'radio' }}" name="{{ $multiple ? $name.'[]' : $name }}" value="{{ $optionValue }}" @checked(in_array((string) $optionValue, $selected, true))>
            {{ $optionLabel }}
            @if ($optionCount !== null)
                <span class="oc-chip-filter-count">{{ $optionCount }}</span>
            @endif
        </label>
    @endforeach
    {{ $slot }}
</div>
