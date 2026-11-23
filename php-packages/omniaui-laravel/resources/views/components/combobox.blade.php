{{-- File: resources/views/components/combobox.blade.php | Map: props -> .oc-combobox[data-oc-combobox] (icon of the chosen value, field, hidden input) -> listbox (clear row, options, custom row, empty) -> optional footer with a manage link
     OmniaUI combobox: a field with a filtered list. Typing, arrow keys, Enter and Escape need oc-combobox.js
     (`npx omniaui copy-js combobox`). Props: options (value => label, or value => ['label' => 'GitHub', 'icon' => 'mdi:github',
     'disabled' => true]), value (chosen), name (hidden input for the form), label (aria-label), placeholder, icon (field icon
     while nothing is chosen), empty (text when nothing matches), id.
     Catalog mode (0.17.0): options may also have 'description', 'image' and 'emoji'; value-type (string|number, data only:
     the hidden input stays a string); search ("event": event oc-combobox-search { query }, answer with el.ocSetOptions(items))
     or search-url ("/customers/search?q=": fetch, JSON [{ value, label, description, icon, image, emoji }]); search-delay
     (ms, default 250); selected (['value' => 42, 'label' => 'Company 42', ...]: label of a value that is not in options);
     clear-label (first row that clears); manage-href + manage-label (footer link outside the listbox); allow-custom-from-search
     + custom-label ('Use "{query}"'); portal (list in document.body while open); variant ("ledger"); module (data-module). --}}
@props([
    'options' => [], 'value' => null, 'name' => null, 'label' => 'Choose', 'placeholder' => null, 'icon' => null, 'empty' => 'No results', 'id' => null,
    'valueType' => 'string', 'search' => null, 'searchUrl' => null, 'searchDelay' => null, 'loadingText' => null, 'selected' => null,
    'clearLabel' => null, 'manageHref' => null, 'manageLabel' => 'Manage', 'allowCustomFromSearch' => false, 'customLabel' => 'Use "{query}"',
    'portal' => false, 'variant' => null, 'module' => null,
])
@php($id = $id ?: 'oc-combobox-'.substr(md5(uniqid('', true)), 0, 6))
@php($items = collect($options)->map(fn ($o) => is_array($o) ? $o : ['label' => $o]))
@php($selectedItem = is_array($selected) ? $selected : null)
@php($chosen = $value !== null && $value !== '' ? ($items[$value] ?? (($selectedItem && (string) ($selectedItem['value'] ?? '') === (string) $value) ? $selectedItem : null)) : null)
@php($hasVisual = fn ($o) => ! empty($o['icon']) || ! empty($o['image']) || ! empty($o['emoji']))
@php($withIcons = $icon || $items->contains($hasVisual) || ($selectedItem && $hasVisual($selectedItem)))
@php($ledger = $variant === 'ledger')
@php($footer = filled($manageHref))
<div {{ $attributes->class(['oc-combobox', 'oc-combobox--ledger' => $ledger])->merge(array_filter([
    'data-oc-search' => $search ?: null,
    'data-oc-search-url' => $searchUrl ?: null,
    'data-oc-search-delay' => $searchDelay,
    'data-oc-loading-text' => $loadingText,
    'data-oc-value-type' => $valueType !== 'string' ? $valueType : null,
    'data-module' => $module,
], fn ($v) => $v !== null)) }} data-oc-combobox @if ($portal) data-oc-portal @endif>
@if ($withIcons)
    <span class="oc-combobox-icon" aria-hidden="true">@if ($chosen && ! empty($chosen['icon']))<x-oc::webicon :name="$chosen['icon']" bare fallback="iconify" />@elseif ($chosen && ! empty($chosen['image']))<img class="oc-combobox-option-image" src="{{ $chosen['image'] }}" alt="">@elseif ($chosen && ! empty($chosen['emoji']))<span class="oc-combobox-option-emoji" aria-hidden="true">{{ $chosen['emoji'] }}</span>@elseif ($icon)<x-oc::webicon :name="$icon" bare fallback="iconify" />@endif</span>
@endif
    <input @class(['oc-input', 'oc-combobox-input', 'oc-input--ledger' => $ledger]) type="text" role="combobox" autocomplete="off" aria-expanded="false" aria-controls="{{ $id }}" aria-autocomplete="list" aria-label="{{ $label }}" @if ($placeholder) placeholder="{{ $placeholder }}" @endif value="{{ $chosen['label'] ?? '' }}">
@if ($name)
    <input type="hidden" name="{{ $name }}" value="{{ $value }}">
@endif
@if ($footer)
    <div class="oc-combobox-list oc-combobox-list--panel">
    <ul class="oc-combobox-options" id="{{ $id }}" role="listbox" aria-label="{{ $label }}">
@else
    <ul class="oc-combobox-list" id="{{ $id }}" role="listbox" aria-label="{{ $label }}">
@endif
@if ($clearLabel)
        <li class="oc-combobox-option oc-combobox-clear" role="option" tabindex="-1" data-value="" aria-selected="false">{{ $clearLabel }}</li>
@endif
@foreach ($items as $optionValue => $option)
        <li class="oc-combobox-option" role="option" tabindex="-1" data-value="{{ $optionValue }}" aria-selected="{{ $value !== null && (string) $optionValue === (string) $value ? 'true' : 'false' }}" @if (! empty($option['disabled'])) aria-disabled="true" @endif>@if (! empty($option['icon']))<span class="oc-combobox-option-icon" aria-hidden="true"><x-oc::webicon :name="$option['icon']" bare fallback="iconify" /></span>@elseif (! empty($option['image']))<img class="oc-combobox-option-image" src="{{ $option['image'] }}" alt="">@elseif (! empty($option['emoji']))<span class="oc-combobox-option-emoji" aria-hidden="true">{{ $option['emoji'] }}</span>@endif @if (! empty($option['description']))<span class="oc-combobox-option-text"><span class="oc-combobox-option-label">{{ $option['label'] }}</span><span class="oc-combobox-option-description">{{ $option['description'] }}</span></span>@else{{ $option['label'] }}@endif</li>
@endforeach
@if ($allowCustomFromSearch)
        <li class="oc-combobox-option oc-combobox-custom" role="option" tabindex="-1" aria-selected="false" data-oc-custom-label="{{ $customLabel }}" hidden></li>
@endif
        <li class="oc-combobox-empty" role="presentation" hidden>{{ $empty }}</li>
    </ul>
@if ($footer)
    <div class="oc-combobox-footer"><a href="{{ $manageHref }}" tabindex="-1">{{ $manageLabel }}</a></div>
    </div>
@endif
</div>
