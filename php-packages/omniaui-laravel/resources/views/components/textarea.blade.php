{{-- OmniaCSS textarea. Props: rows (default 4), error. Slot: initial value. Attributes go to the textarea. --}}
@props(['rows' => 4, 'error' => null])
@php
    $invalid = $error ?? ($attributes->has('name') && isset($errors) && $errors->has((string) $attributes->get('name')));
@endphp
<textarea {{ $attributes->class(['oc-input', 'oc-input--error' => $invalid])->merge(['rows' => $rows]) }} @if ($invalid) aria-invalid="true" @endif>{{ $slot }}</textarea>
