{{-- OmniaCSS slider (range input). Props: value, min, max, step, vertical, label (renders an .oc-field with a label; otherwise pass aria-label), id.
     Attributes (name, disabled, wire:model, ...) go to the input. The fill length is set on the server and kept in sync by a one-line oninput. --}}
@props(['value' => 0, 'min' => 0, 'max' => 100, 'step' => null, 'vertical' => false, 'label' => null, 'id' => null])
@php
    $id = $id ?: ($label !== null ? 'oc-slider-'.substr(md5(uniqid('', true)), 0, 6) : null);
    $range = (float) $max - (float) $min;
    $percent = $range > 0 ? max(0, min(100, round(((float) $value - (float) $min) / $range * 100, 2))) : 0;
@endphp
@if ($label !== null)<div class="oc-field">
    <label class="oc-field-label" for="{{ $id }}">{{ $label }}</label>@endif
<input {{ $attributes->class(['oc-slider', 'oc-slider--vertical' => $vertical])->merge(['type' => 'range', 'id' => $id, 'min' => $min, 'max' => $max, 'step' => $step, 'value' => $value, 'style' => '--oc-slider-progress: '.$percent.'%']) }} oninput="this.style.setProperty('--oc-slider-progress', (this.value - this.min) / (this.max - this.min) * 100 + '%')">
@if ($label !== null)</div>@endif
