{{-- File: resources/views/components/combobox.blade.php | Map: props -> .oc-combobox[data-oc-combobox] (icon of the chosen value, field, hidden input) -> listbox with options
     OmniaUI combobox: a field with a filtered list. Typing, arrow keys, Enter and Escape need oc-combobox.js
     (`npx omniaui copy-js combobox`). Props: options (value => label, or value => ['label' => 'GitHub', 'icon' => 'mdi:github',
     'disabled' => true]), value (chosen), name (hidden input for the form), label (aria-label), placeholder, icon (field icon
     while nothing is chosen), empty (text when nothing matches), id. --}}
@props(['options' => [], 'value' => null, 'name' => null, 'label' => 'Choose', 'placeholder' => null, 'icon' => null, 'empty' => 'No results', 'id' => null])
@php($id = $id ?: 'oc-combobox-'.substr(md5(uniqid('', true)), 0, 6))
@php($items = collect($options)->map(fn ($o) => is_array($o) ? $o : ['label' => $o]))
@php($chosen = $value !== null ? ($items[$value] ?? null) : null)
@php($withIcons = $icon || $items->contains(fn ($o) => ! empty($o['icon'])))
@php($fieldIcon = $chosen['icon'] ?? $icon)
<div {{ $attributes->class(['oc-combobox']) }} data-oc-combobox>
@if ($withIcons)
    <span class="oc-combobox-icon" aria-hidden="true">@if ($fieldIcon)<iconify-icon icon="{{ $fieldIcon }}" aria-hidden="true"></iconify-icon>@endif</span>
@endif
    <input class="oc-input oc-combobox-input" type="text" role="combobox" autocomplete="off" aria-expanded="false" aria-controls="{{ $id }}" aria-autocomplete="list" aria-label="{{ $label }}" @if ($placeholder) placeholder="{{ $placeholder }}" @endif value="{{ $chosen['label'] ?? '' }}">
@if ($name)
    <input type="hidden" name="{{ $name }}" value="{{ $value }}">
@endif
    <ul class="oc-combobox-list" id="{{ $id }}" role="listbox" aria-label="{{ $label }}">
@foreach ($items as $optionValue => $option)
        <li class="oc-combobox-option" role="option" tabindex="-1" data-value="{{ $optionValue }}" aria-selected="{{ (string) $optionValue === (string) $value ? 'true' : 'false' }}" @if (! empty($option['disabled'])) aria-disabled="true" @endif>@if (! empty($option['icon']))<span class="oc-combobox-option-icon" aria-hidden="true"><iconify-icon icon="{{ $option['icon'] }}" aria-hidden="true"></iconify-icon></span>@endif{{ $option['label'] }}</li>
@endforeach
        <li class="oc-combobox-empty" role="presentation" hidden>{{ $empty }}</li>
    </ul>
</div>
