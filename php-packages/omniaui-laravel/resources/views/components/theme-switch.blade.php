{{-- OmniaCSS theme switch (CSS only: color-scheme + :has()). Props: name, value (system|light|dark), label,
     options (which modes to offer, default ['system', 'light', 'dark']; ['light', 'dark'] = only light and dark),
     icons (false | true = monitor/sun/moon only, text for screen readers and as tooltip | 'text' = icon + text). --}}
@props(['name' => 'oc-theme', 'value' => 'system', 'label' => 'Color theme', 'icons' => false, 'options' => ['system', 'light', 'dark']])
@php
    $iconOnly = $icons === true;
    $iconNames = ['system' => 'mdi:monitor', 'light' => 'mdi:white-balance-sunny', 'dark' => 'mdi:weather-night'];
    $texts = ['system' => 'System', 'light' => 'Light', 'dark' => 'Dark'];
    $modes = array_values(array_filter((array) $options, fn ($o) => isset($texts[$o])));
    $value = in_array($value, $modes, true) ? $value : ($modes[0] ?? 'system');
@endphp
<fieldset {{ $attributes->class(['oc-theme-switch', 'oc-theme-switch--icons' => $iconOnly])->merge(['aria-label' => $label]) }}>
    @foreach ($modes as $option)
        @php($text = $texts[$option])
        <label @if ($iconOnly) title="{{ $text }}" @endif><input type="radio" name="{{ $name }}" value="{{ $option }}" @checked($value === $option)>@if ($icons)<x-oc::webicon :name="$iconNames[$option]" bare fallback="iconify" />@endif @if ($iconOnly)<span class="oc-theme-switch__text">{{ $text }}</span>@else{{ $text }}@endif</label>
    @endforeach
</fieldset>
