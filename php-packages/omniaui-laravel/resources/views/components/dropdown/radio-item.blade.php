{{-- File: resources/views/components/dropdown/radio-item.blade.php | Map: props -> <x-oc::dropdown.item radio> + data-value
     OmniaUI dropdown radio item (0.17.2): a dropdown item with role menuitemradio and aria-checked, for
     <x-oc::dropdown.radio-group>. Props: value (data-value), checked (true when chosen), and everything of
     <x-oc::dropdown.item> (href, icon, tone, description, hint, destructive, disabled). With Livewire:
     wire:click="$set('sort', 'name')" and :checked="$sort === 'name'". Slot: the label. --}}
@props(['value' => null, 'checked' => false, 'href' => null, 'icon' => null, 'tone' => null, 'description' => null,
    'hint' => null, 'destructive' => false, 'disabled' => false])
<x-oc::dropdown.item radio :checked="(bool) $checked" :href="$href" :icon="$icon" :tone="$tone" :description="$description" :hint="$hint" :destructive="$destructive" :disabled="$disabled" {{ $attributes->merge(['data-value' => $value]) }}>{{ $slot }}</x-oc::dropdown.item>
