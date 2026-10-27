{{-- OmniaCSS select. Props: options (value => label), value (selected), placeholder, error. Slot: raw <option> markup. Attributes go to the select. --}}
@props(['options' => [], 'value' => null, 'placeholder' => null, 'error' => null])
@php
    $invalid = $error ?? ($attributes->has('name') && isset($errors) && $errors->has(rtrim((string) $attributes->get('name'), '[]')));
@endphp
<select {{ $attributes->class(['oc-select']) }} @if ($invalid) aria-invalid="true" @endif>
    @if ($placeholder !== null)
        <option value="">{{ $placeholder }}</option>
    @endif
    @foreach ($options as $optionValue => $optionLabel)
        <option value="{{ $optionValue }}" @selected((string) $value === (string) $optionValue)>{{ $optionLabel }}</option>
    @endforeach
    {{ $slot }}
</select>
