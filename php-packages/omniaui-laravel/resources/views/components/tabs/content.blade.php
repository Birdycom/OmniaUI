{{-- OmniaCSS panel of the compound tabs (0.17.0): .oc-tab-panel[role=tabpanel], .is-active when value matches active on
     <x-oc::tabs>. Props: value (required). Slot: panel content. --}}
@aware(['name' => 'oc-tabs', 'active' => null])
@props(['value' => '', 'name' => 'oc-tabs', 'active' => null])
@php
    $key = preg_replace('/[^A-Za-z0-9_-]+/', '-', (string) $value);
    $on = $active !== null && (string) $active === (string) $value;
@endphp
<div {{ $attributes->class(['oc-tab-panel', 'is-active' => $on])->merge(['id' => $name.'-'.$key, 'role' => 'tabpanel', 'aria-labelledby' => $name.'-tab-'.$key, 'tabindex' => '0', 'data-state' => $on ? 'active' : 'inactive']) }}>{{ $slot }}</div>
