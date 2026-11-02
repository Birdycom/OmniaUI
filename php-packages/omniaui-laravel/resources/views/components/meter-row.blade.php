{{-- OmniaUI meter row. Props: label, percent (0-100), value (text after the percentage), reset, level (ok|warn|critical;
     default from the percentage: warn from 75, critical from 90). --}}
@props(['label' => '', 'percent' => 0, 'value' => null, 'reset' => null, 'level' => null])
@php
    $pct = max(0, min(100, (int) round($percent)));
    $level = $level ?? ($pct >= 90 ? 'critical' : ($pct >= 75 ? 'warn' : 'ok'));
@endphp
<div {{ $attributes->class(['oc-meter-row']) }} @if($level !== 'ok') data-level="{{ $level }}" @endif style="--oc-meter: {{ $pct }}%">
    <span class="oc-meter-row__label">{{ $label }}</span>
    <span class="oc-meter-row__value"><strong>{{ $pct }}%</strong>@if ($value) · {{ $value }}@endif</span>
    <span class="oc-meter-row__bar" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{ $pct }}" aria-label="{{ $label }}"></span>
    @if ($reset)<span class="oc-meter-row__reset">{{ $reset }}</span>@endif
</div>
