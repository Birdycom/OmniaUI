{{-- File: resources/views/components/toggle-field.blade.php | Map: props -> label row -> text (label + description) -> span.oc-switch + checkbox
     OmniaUI toggle field. Props: label, description, card, reverse, id.
     Attributes (name, checked, wire:model...) go to the checkbox; `class` goes to the row. --}}
@props(['label' => null, 'description' => null, 'card' => false, 'reverse' => false, 'id' => null])
@php($descId = ($id ?: 'oc-toggle-field-'.substr(md5(uniqid('', true)), 0, 6)).'-desc')
<label @class(['oc-toggle-field', 'oc-toggle-field--card' => $card, 'oc-toggle-field--reverse' => $reverse, (string) $attributes->get('class') => $attributes->has('class')])>
    <span class="oc-toggle-field-text">
        <span class="oc-toggle-field-label">{{ $label ?? $slot }}</span>
        @if ($description)
            <span class="oc-toggle-field-description" id="{{ $descId }}">{{ $description }}</span>
        @endif
    </span>
    <span class="oc-switch">
        <input {{ $attributes->except('class')->merge(['type' => 'checkbox', 'role' => 'switch', 'id' => $id, 'aria-describedby' => $description ? $descId : null]) }}>
        <span class="oc-switch-track"></span>
    </span>
</label>
