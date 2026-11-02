{{-- OmniaUI date field. Props: name, id, value (YYYY-MM-DD), week (ISO week label, filled by form-extras.js),
     week-label ("Week {week}", may use {year}), size (md|sm). Other attributes go on the input. --}}
@props(['name' => null, 'id' => null, 'value' => null, 'week' => true, 'weekLabel' => 'Week {week}', 'size' => 'md'])
@php
    $id = $id ?? $name;
    $label = '';
    if ($week && $value) {
        $date = \Carbon\CarbonImmutable::parse($value);
        $label = str_replace(['{week}', '{year}'], [$date->isoWeek(), $date->isoWeekYear()], $weekLabel);
    }
@endphp
<div @class(['oc-date-field', 'oc-date-field--sm' => $size === 'sm'])>
    <span class="oc-date-field__icon"><iconify-icon icon="mdi:calendar-blank-outline" aria-hidden="true"></iconify-icon></span>
    <input {{ $attributes->class(['oc-date-field__input'])->merge(['type' => 'date', 'name' => $name, 'id' => $id, 'value' => $value]) }}>
    @if ($week)
        <output class="oc-date-field__week" @if($id) for="{{ $id }}" @endif data-oc-week="{{ $weekLabel }}">{{ $label }}</output>
    @endif
</div>
