{{-- File: resources/views/components/decimal-input.blade.php | Map: props -> input (optionally inside a unit frame)
     OmniaUI decimal input. Props: unit (text after the value), start (left-aligned), error,
     pattern (default: comma decimals like 1.234,56). Attributes (name, value, id...) go to the input.
     Format the value on the server, e.g. number_format($n, 2, ',', '.'). --}}
@props(['unit' => null, 'start' => false, 'error' => false, 'pattern' => '[0-9.]*(,[0-9]{1,2})?'])
@php($input = $attributes->class(['oc-input', 'oc-decimal-input', 'oc-decimal-input--start' => $start])->merge(['type' => 'text', 'inputmode' => 'decimal', 'pattern' => $pattern, 'aria-invalid' => $error ? 'true' : null]))
@if ($unit)
    <div class="oc-decimal-field">
        <input {{ $input }}>
        <span class="oc-decimal-field-unit">{{ $unit }}</span>
    </div>
@else
    <input {{ $input }}>
@endif
