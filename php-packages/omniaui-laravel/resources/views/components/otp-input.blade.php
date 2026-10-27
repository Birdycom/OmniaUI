{{-- OmniaCSS one-time-code input. Props: length (default 6), label, description, id, name, error. Attributes (wire:model, ...) go to the input. --}}
@props(['length' => 6, 'label' => null, 'description' => null, 'id' => null, 'name' => 'code', 'error' => false])
@php($id = $id ?: 'oc-otp-'.substr(md5(uniqid('', true)), 0, 6))
<div class="oc-field">
    @if ($label)
        <label class="oc-field-label" for="{{ $id }}">{{ $label }}</label>
    @endif
    <input {{ $attributes->class(['oc-otp'])->merge(['id' => $id, 'name' => $name, 'type' => 'text', 'inputmode' => 'numeric', 'autocomplete' => 'one-time-code', 'maxlength' => $length, 'pattern' => '[0-9]*', 'style' => '--oc-otp-length: '.(int) $length]) }} @if ($error) aria-invalid="true" @endif>
    @if ($description)
        <p class="oc-field-description">{{ $description }}</p>
    @endif
</div>
