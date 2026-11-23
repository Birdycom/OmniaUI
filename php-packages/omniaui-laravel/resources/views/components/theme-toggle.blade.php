{{-- File: resources/views/components/theme-toggle.blade.php | Map: props -> button[data-oc-theme-toggle] (both icons, theme.js shows one) -> optional text
     OmniaUI theme toggle (0.17.0): one button that switches between light and dark; needs theme.js (npx omniaui copy-js theme),
     which sets data-theme and aria-pressed. Props: ghost (default true), labels (to-dark / to-light texts),
     text (icon and the name of the theme a click gives in the button, instead of a tooltip). --}}
@props(['ghost' => true, 'labels' => [], 'text' => false])
@php($toDark = $labels['toDark'] ?? 'Dark theme')
@php($toLight = $labels['toLight'] ?? 'Light theme')
@if ($text)
<button type="button" {{ $attributes->class(['oc-btn', 'oc-btn--ghost' => $ghost, 'oc-btn--outline' => ! $ghost])->merge(['data-oc-theme-toggle' => '']) }}>
    <span class="oc-theme-img--light"><x-oc::webicon name="mdi:weather-night" bare fallback="iconify" /></span>
    <span class="oc-theme-img--dark"><x-oc::webicon name="mdi:white-balance-sunny" bare fallback="iconify" /></span>
    <span class="oc-theme-img--light">{{ $toDark }}</span>
    <span class="oc-theme-img--dark">{{ $toLight }}</span>
</button>
@else
<button type="button" {{ $attributes->class(['oc-btn oc-btn--icon oc-tooltip oc-tooltip--bottom', 'oc-btn--ghost' => $ghost, 'oc-btn--outline' => ! $ghost])->merge(['data-oc-theme-toggle' => '', 'aria-label' => $toDark.' / '.$toLight, 'data-tooltip' => $toDark.' / '.$toLight]) }}>
    <span class="oc-theme-img--light"><x-oc::webicon name="mdi:weather-night" bare fallback="iconify" /></span>
    <span class="oc-theme-img--dark"><x-oc::webicon name="mdi:white-balance-sunny" bare fallback="iconify" /></span>
</button>
@endif
