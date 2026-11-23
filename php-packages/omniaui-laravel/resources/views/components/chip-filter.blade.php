{{-- File: resources/views/components/chip-filter.blade.php | Map: props -> group -> chip label per option (checkbox / radio + text + count)
     OmniaUI chip filter. Props: name (required), options (value => label, value => [label, count], or value => ['label', 'count', 'disabled']),
     value (string, or array with multiple), multiple (checkboxes, name gets []), disabled (list of option values that cannot be chosen),
     label (aria-label), size (sm), scroll. Attributes go to the group. --}}
@props(['name', 'options' => [], 'value' => null, 'multiple' => false, 'disabled' => [], 'label' => null, 'size' => null, 'scroll' => false])
@php
    // Inline @php(...) and @php blocks can't be mixed in one file, so blocks only here.
    $selected = array_map('strval', (array) $value);
    $off = array_map('strval', (array) $disabled);
@endphp
<div {{ $attributes->class(['oc-chip-filter', 'oc-chip-filter--sm' => $size === 'sm', 'oc-chip-filter--scroll' => $scroll])->merge(['role' => $multiple ? 'group' : 'radiogroup', 'aria-label' => $label]) }}>
    @foreach ($options as $optionValue => $option)
        @php
            // An option is "Label", ["Label", count] or ['label' => ..., 'count' => ..., 'disabled' => bool].
            $optionLabel = is_array($option) ? ($option['label'] ?? $option[0] ?? '') : $option;
            $optionCount = is_array($option) ? ($option['count'] ?? $option[1] ?? null) : null;
            $optionOff = (is_array($option) && ! empty($option['disabled'])) || in_array((string) $optionValue, $off, true);
        @endphp
        <label class="oc-chip-filter-item">
            <input type="{{ $multiple ? 'checkbox' : 'radio' }}" name="{{ $multiple ? $name.'[]' : $name }}" value="{{ $optionValue }}" @checked(in_array((string) $optionValue, $selected, true)) @disabled($optionOff)>
            {{ $optionLabel }}
            @if ($optionCount !== null)
                <span class="oc-chip-filter-count">{{ $optionCount }}</span>
            @endif
        </label>
    @endforeach
    {{ $slot }}
</div>
