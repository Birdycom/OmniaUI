{{-- File: resources/views/components/resizable/panel.blade.php | Map: props -> div.oc-resizable-panel
     OmniaUI resizable pane (0.17.0). Props: resizable (this pane gets the resize grip; the others take the remaining space). --}}
@props(['resizable' => false])
<div {{ $attributes->class(['oc-resizable-panel', 'oc-resizable-panel--resizable' => $resizable]) }}>{{ $slot }}</div>
