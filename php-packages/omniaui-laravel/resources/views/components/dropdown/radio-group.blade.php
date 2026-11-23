{{-- File: resources/views/components/dropdown/radio-group.blade.php | Map: props -> div[role=group] -> items (radio-item each) | slot
     OmniaUI dropdown radio group (0.17.2): one choice out of a few in a dropdown menu (sort by, density, theme). Props:
     value (the chosen value), items (list of ['value' => 'name', 'label' => 'Name', 'icon', 'hint', 'description',
     'href']: rendered as <x-oc::dropdown.radio-item>, the one matching value is checked), model (Livewire: the property;
     each item gets wire:click="$set('model', 'value')"). Slot: extra <x-oc::dropdown.radio-item>s (give them :checked).
     Radio items keep the menu open (also in toggle mode). Other attributes go to the group. --}}
@props(['value' => null, 'items' => [], 'model' => null])
@php
    // Livewire: model="sort" gives every item wire:click="$set('sort', 'value')".
    $wire = fn ($v) => new \Illuminate\View\ComponentAttributeBag($model ? ['wire:click' => "\$set('".$model."', '".addslashes((string) $v)."')"] : []);
@endphp
<div {{ $attributes->class(['oc-dropdown-radio-group'])->merge(['role' => 'group']) }}>@foreach ($items as $item)<x-oc::dropdown.radio-item :value="(string) ($item['value'] ?? '')" :checked="$value !== null && (string) $value === (string) ($item['value'] ?? '')" :href="$item['href'] ?? null" :icon="$item['icon'] ?? null" :hint="$item['hint'] ?? null" :description="$item['description'] ?? null" :attributes="$wire($item['value'] ?? '')">{{ $item['label'] ?? ($item['value'] ?? '') }}</x-oc::dropdown.radio-item>@endforeach{{ $slot }}</div>
