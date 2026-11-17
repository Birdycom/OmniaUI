{{-- File: resources/views/components/countdown.blade.php | Map: props -> div.oc-countdown[data-oc-countdown] (label, time)
     OmniaUI countdown: the time left for a task, a round or a reservation. Load /js/oc-countdown.js (npx omniaui copy-js
     countdown) to make it tick. Props: until (an end time: Carbon, DateTime or ISO string) or seconds (from page load),
     total (seconds, for the bar), low (seconds from which it turns orange), label ('Time left'), variant (inline|pill|display),
     bar (a shrinking bar). --}}
@props(['until' => null, 'seconds' => null, 'total' => null, 'low' => null, 'label' => 'Time left', 'variant' => 'inline', 'bar' => false])
@php
    $end = $until instanceof \DateTimeInterface ? $until->format(DATE_ATOM) : $until;
    $left = $end ? max(0, strtotime((string) $end) - time()) : (int) $seconds;
    $text = $left >= 3600 ? sprintf('%d:%02d:%02d', intdiv($left, 3600), intdiv($left % 3600, 60), $left % 60) : sprintf('%d:%02d', intdiv($left, 60), $left % 60);
@endphp
<div {{ $attributes->class(['oc-countdown', 'oc-countdown--'.$variant => $variant !== 'inline', 'oc-countdown--bar' => $bar])->merge(array_filter([
    'role' => 'timer',
    'aria-label' => $label,
    'data-oc-countdown' => '',
    'data-oc-countdown-end' => $end,
    'data-oc-countdown-seconds' => $end ? null : (string) (int) $seconds,
    'data-oc-countdown-total' => $total !== null ? (string) $total : null,
    'data-oc-countdown-low' => $low !== null ? (string) $low : null,
], fn ($v) => $v !== null)) }}>
    @if ($label)<span class="oc-countdown-label">{{ $label }}</span>@endif
    <b class="oc-countdown-time">{{ $text }}</b>
</div>
