{{-- OmniaCSS item group (vertical list of items). Props: outline (bordered box). Slot: <x-oc::item> entries with <hr class="oc-item-separator"> between them. --}}
@props(['outline' => false])
<div {{ $attributes->class(['oc-item-group']) }} @if ($outline) style="border:1px solid var(--oc-border);border-radius:var(--oc-radius);padding:.25rem" @endif>{{ $slot }}</div>
