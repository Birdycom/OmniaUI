{{-- File: resources/views/components/save-status.blade.php | Map: state -> tone + text -> x-oc::status (aria-live)
     OmniaUI save status (0.17.0): the save state of an editor with its dot. Props: state (saving|saved|dirty|error|offline),
     labels (texts per state), saved-at (time of the last save, shown as 12:04). Livewire: bind state to your property. --}}
@props(['state' => 'saved', 'labels' => [], 'savedAt' => null])
@php
    $tone = ['saving' => 'working', 'saved' => 'done', 'dirty' => 'waiting', 'error' => 'error', 'offline' => 'idle'][$state] ?? 'idle';
    $text = ((array) $labels)[$state] ?? ['saving' => 'Saving…', 'saved' => 'Saved', 'dirty' => 'Unsaved changes', 'error' => 'Not saved', 'offline' => 'Offline: changes are kept on this device'][$state] ?? $state;
    $time = $savedAt ? ($savedAt instanceof \DateTimeInterface ? $savedAt : new \DateTimeImmutable((string) $savedAt))->format('H:i') : null;
@endphp
<x-oc::status :tone="$tone" :meta="$time" {{ $attributes->merge(['role' => 'status', 'aria-live' => 'polite', 'data-state' => $state]) }}>{{ $text }}</x-oc::status>
