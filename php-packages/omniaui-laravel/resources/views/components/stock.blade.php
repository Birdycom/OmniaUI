{{-- OmniaUI stock status. Props: level (ok|low|out|order), badge, note. Slot = the text (default per level). --}}
@props(['level' => 'ok', 'badge' => false, 'note' => null])
@php
    $text = ['ok' => 'In stock', 'low' => 'Low stock', 'out' => 'Out of stock', 'order' => 'On order'][$level] ?? 'In stock';
@endphp
<span {{ $attributes->class(['oc-stock', 'oc-stock--badge' => $badge]) }} @if($level !== 'ok') data-level="{{ $level }}" @endif>{{ $slot->isEmpty() ? $text : $slot }}@if ($note)<span class="oc-stock__note"> · {{ $note }}</span>@endif</span>
