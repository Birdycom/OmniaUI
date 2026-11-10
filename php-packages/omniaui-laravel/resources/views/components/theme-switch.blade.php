{{-- OmniaCSS theme switch (CSS only: color-scheme + :has()). Props: name, value (system|light|dark), label,
     icons (false | true = monitor/sun/moon only, text for screen readers and as tooltip | 'text' = icon + text). --}}
@props(['name' => 'oc-theme', 'value' => 'system', 'label' => 'Color theme', 'icons' => false])
@php
    $iconOnly = $icons === true;
    $iconNames = ['system' => 'mdi:monitor', 'light' => 'mdi:white-balance-sunny', 'dark' => 'mdi:weather-night'];
@endphp
<fieldset {{ $attributes->class(['oc-theme-switch', 'oc-theme-switch--icons' => $iconOnly])->merge(['aria-label' => $label]) }}>
    @foreach (['system' => 'System', 'light' => 'Light', 'dark' => 'Dark'] as $option => $text)
        <label @if ($iconOnly) title="{{ $text }}" @endif><input type="radio" name="{{ $name }}" value="{{ $option }}" @checked($value === $option)>@if ($icons)<iconify-icon icon="{{ $iconNames[$option] }}" aria-hidden="true"></iconify-icon>@endif @if ($iconOnly)<span class="oc-theme-switch__text">{{ $text }}</span>@else{{ $text }}@endif</label>
    @endforeach
</fieldset>
