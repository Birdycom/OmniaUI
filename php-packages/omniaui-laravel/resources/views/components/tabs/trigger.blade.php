{{-- OmniaCSS tab of the compound tabs (0.17.0): button.oc-tab-trigger[role=tab] for the panel with the same value.
     Props: value (required), icon (webicon name), count, tone (success|info|warning: color of the count), disabled.
     Selected when it matches active on <x-oc::tabs>. Livewire: with model (or wire:model) on <x-oc::tabs> a click runs
     $set('<model>', '<value>'). Slot: the label. --}}
@aware(['name' => 'oc-tabs', 'active' => null, 'model' => null])
@props(['value' => '', 'icon' => null, 'count' => null, 'tone' => null, 'disabled' => false, 'name' => 'oc-tabs', 'active' => null, 'model' => null])
@php
    $key = preg_replace('/[^A-Za-z0-9_-]+/', '-', (string) $value);
    $on = $active !== null && (string) $active === (string) $value;
    $wire = $model ?: $__env->getConsumableComponentData('wire:model');
@endphp
<button {{ $attributes->class(['oc-tab-trigger'])->merge([
    'type' => 'button',
    'role' => 'tab',
    'id' => $name.'-tab-'.$key,
    'aria-selected' => $on ? 'true' : 'false',
    'aria-controls' => $name.'-'.$key,
    'data-state' => $on ? 'active' : 'inactive',
    'wire:click' => $wire ? '$set('.\Illuminate\Support\Js::from((string) $wire).', '.\Illuminate\Support\Js::from((string) $value).')' : null,
]) }} @disabled($disabled)>@if ($icon)<x-oc::webicon :name="$icon" bare fallback="iconify" />@endif{{ $slot }}@if ($count !== null && $count !== '')<span @class(['oc-data-table-tab-count', 'oc-data-table-tab-count--'.$tone => in_array($tone, ['success', 'info', 'warning'], true)])>{{ $count }}</span>@endif</button>
