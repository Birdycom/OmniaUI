{{-- OmniaCSS textarea. Props: rows (default 4), error. Slot: initial value. Attributes go to the textarea.
     0.17.0: variant ("ledger": .oc-textarea--ledger), module (data-module). --}}
@props(['rows' => 4, 'error' => null, 'variant' => null, 'module' => null])
@php
    $invalid = $error ?? ($attributes->has('name') && isset($errors) && $errors->has((string) $attributes->get('name')));
@endphp
<textarea {{ $attributes->class(['oc-input', 'oc-input--error' => $invalid, 'oc-textarea--ledger' => $variant === 'ledger'])->merge(['rows' => $rows])->merge(array_filter(['data-module' => $module], fn ($v) => $v !== null)) }} @if ($invalid) aria-invalid="true" @endif>{{ $slot }}</textarea>
