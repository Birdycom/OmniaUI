{{-- OmniaCSS keyboard key. Props: keys (array or "Ctrl+K" string; renders a group), sep (show "+" between keys). Without keys the slot is one <kbd>. --}}
@props(['keys' => null, 'sep' => false])
@php
    $list = is_string($keys) ? array_values(array_filter(array_map('trim', explode('+', $keys)), 'strlen')) : (array) $keys;
@endphp
@if ($keys === null || $list === [])
    <kbd {{ $attributes->class(['oc-kbd']) }}>{{ $slot }}</kbd>
@else
    <span {{ $attributes->class(['oc-kbd-group']) }}>
        @foreach ($list as $key)
            @if ($sep && ! $loop->first)<span class="oc-kbd-sep">+</span>@endif
            <kbd class="oc-kbd">{{ $key }}</kbd>
        @endforeach
    </span>
@endif
