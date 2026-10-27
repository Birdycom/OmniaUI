{{-- File: resources/views/components/time-input.blade.php | Map: props -> 24h text field -> datalist of slots
     OmniaUI time input (HH:mm). Props: id, slots (list of "HH:mm" suggestions), error.
     Attributes (name, value, wire:model...) go to the input. For a slot list use the snippet markup (.oc-time-slots). --}}
@props(['id' => null, 'slots' => [], 'error' => false])
@php($id = $id ?: 'oc-time-'.substr(md5(uniqid('', true)), 0, 6))
<input {{ $attributes->class(['oc-input', 'oc-time-input'])->merge([
    'id' => $id,
    'type' => 'text',
    'inputmode' => 'numeric',
    'maxlength' => '5',
    'placeholder' => 'hh:mm',
    'pattern' => '([01][0-9]|2[0-3]):[0-5][0-9]',
    'list' => count($slots) ? $id.'-slots' : null,
    'aria-invalid' => $error ? 'true' : null,
]) }}>
@if (count($slots))
    <datalist id="{{ $id }}-slots">
        @foreach ($slots as $slot)
            <option value="{{ $slot }}"></option>
        @endforeach
    </datalist>
@endif
