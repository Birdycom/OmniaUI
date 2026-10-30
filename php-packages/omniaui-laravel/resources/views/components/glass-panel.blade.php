{{-- File: resources/views/components/glass-panel.blade.php | Map: props -> div.oc-glass-panel -> slot
     OmniaUI glass panel: a lighter layer inside a glass sheet. Props: strong. --}}
@props(['strong' => false])
<div {{ $attributes->class(['oc-glass-panel', 'oc-glass-panel--strong' => $strong]) }}>{{ $slot }}</div>
