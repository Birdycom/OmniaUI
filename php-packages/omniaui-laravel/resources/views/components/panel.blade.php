{{-- OmniaUI panel. Props: glow (start|end|both). Slot = the content. --}}
@props(['glow' => null])
<div {{ $attributes->class(['oc-panel', 'oc-panel--glow' => in_array($glow, ['start', 'end'], true), 'oc-panel--glow-end' => $glow === 'end', 'oc-panel--glow-both' => $glow === 'both']) }}>{{ $slot }}</div>
