{{-- OmniaCSS input. Props: error (bool; also set automatically when the validator has an error for `name`). Attributes (type, name, wire:model, ...) go to the input.
     0.17.0: variant ("ledger"), module (data-module), mask ("iban" | "bic" | "vat" | "phone" or a pattern: 9 = digit, A = letter,
     * = any), validation-type ("iban" | "bic" | "vat" | "email" | "phone", checked on blur), validation-message (shown in the
     surrounding x-oc::form-field). Mask and validation need oc-input-mask.js (`npx omniaui copy-js input-mask`). --}}
@props(['error' => null, 'variant' => null, 'module' => null, 'mask' => null, 'validationType' => null, 'validationMessage' => null])
@php
    $invalid = $error ?? ($attributes->has('name') && isset($errors) && $errors->has(rtrim((string) $attributes->get('name'), '[]')));
    $data = array_filter([
        'data-module' => $module,
        'data-oc-mask' => $mask,
        'data-oc-validate' => $validationType,
        'data-oc-validation-message' => $validationMessage,
    ], fn ($v) => $v !== null && $v !== '');
@endphp
<input {{ $attributes->class(['oc-input', 'oc-input--error' => $invalid, 'oc-input--ledger' => $variant === 'ledger'])->merge(['type' => 'text'])->merge($data) }} @if ($invalid) aria-invalid="true" @endif>
