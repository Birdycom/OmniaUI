{{-- File: resources/views/components/save-status.blade.php | Map: state -> tone + text -> x-oc::status (aria-live)
     OmniaUI save status (0.17.0): the save state of an editor with its dot. Props: state (saving|saved|dirty|error|offline),
     labels (texts per state, may hold :count), saved-at (time of the last save, shown as 12:04). Livewire: bind state to your property.
     0.18.0 sync indicator: states queued (with count) and online; compact = only the dot (text for screen readers + title). --}}
@props(['state' => 'saved', 'labels' => [], 'savedAt' => null, 'count' => null, 'compact' => false])
@php
    $tone = ['saving' => 'working', 'saved' => 'done', 'dirty' => 'waiting', 'error' => 'error', 'offline' => 'idle', 'queued' => 'waiting', 'online' => 'done'][$state] ?? 'idle';
    $queued = $state === 'queued' && $count !== null ? $count.' '.((int) $count === 1 ? 'change' : 'changes').' waiting to sync' : 'Waiting to sync';
    $text = isset(((array) $labels)[$state]) ? str_replace(':count', (string) ($count ?? 0), ((array) $labels)[$state]) : (['saving' => 'Saving…', 'saved' => 'Saved', 'dirty' => 'Unsaved changes', 'error' => 'Not saved', 'offline' => 'Offline: changes are kept on this device', 'queued' => $queued, 'online' => 'Online'][$state] ?? $state);
    $time = $savedAt ? ($savedAt instanceof \DateTimeInterface ? $savedAt : new \DateTimeImmutable((string) $savedAt))->format('H:i') : null;
@endphp
@if ($compact)
<p {{ $attributes->class(['oc-status', 'oc-status--compact'])->merge(['role' => 'status', 'aria-live' => 'polite', 'data-state' => $state, 'title' => $text]) }}>
    <x-oc::status-dot :tone="$tone" />
    @if ($state === 'queued' && $count)
        <span class="oc-status__count" aria-hidden="true">{{ $count }}</span>
    @endif
    <span class="oc-status__text">{{ $text }}</span>
</p>
@else
<x-oc::status :tone="$tone" :meta="$time" {{ $attributes->merge(['role' => 'status', 'aria-live' => 'polite', 'data-state' => $state]) }}>{{ $text }}</x-oc::status>
@endif
