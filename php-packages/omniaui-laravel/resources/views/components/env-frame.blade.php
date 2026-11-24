{{-- File: resources/views/components/env-frame.blade.php | Map: props -> div.oc-env-frame[data-mode]
     OmniaUI environment frame (0.18.0): a colored line around the viewport in the mode color; pointer-events: none.
     Props: mode (test|live|staging|offline), contained (inside a container with position: relative). --}}
@props(['mode' => 'test', 'contained' => false])
<div {{ $attributes->class(['oc-env-frame', 'oc-env-frame--contained' => $contained])->merge(['data-mode' => $mode, 'aria-hidden' => 'true']) }}></div>
