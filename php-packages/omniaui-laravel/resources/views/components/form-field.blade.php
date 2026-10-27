{{-- OmniaCSS form field. Props: label, for (id of the control), description, error. Slot: the control. --}}
@props(['label' => null, 'for' => null, 'description' => null, 'error' => null, 'name' => null])
@php
    $error = $error ?? ($name && isset($errors) ? $errors->first($name) : null);
@endphp
<div {{ $attributes->class(['oc-field']) }}>
    @if ($label)
        <label class="oc-field-label" @if ($for) for="{{ $for }}" @endif>{{ $label }}</label>
    @endif
    {{ $slot }}
    @if ($description)
        <p class="oc-field-description" @if ($for) id="{{ $for }}-help" @endif>{{ $description }}</p>
    @endif
    @if ($error)
        <p class="oc-field-error" role="alert">{{ $error }}</p>
    @endif
</div>
