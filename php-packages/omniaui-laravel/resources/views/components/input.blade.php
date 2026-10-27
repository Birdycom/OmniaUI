{{-- OmniaCSS input. Props: error (bool; also set automatically when the validator has an error for `name`). Attributes (type, name, wire:model, ...) go to the input. --}}
@props(['error' => null])
@php
    $invalid = $error ?? ($attributes->has('name') && isset($errors) && $errors->has(rtrim((string) $attributes->get('name'), '[]')));
@endphp
<input {{ $attributes->class(['oc-input', 'oc-input--error' => $invalid])->merge(['type' => 'text']) }} @if ($invalid) aria-invalid="true" @endif>
