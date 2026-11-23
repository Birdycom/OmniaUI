{{-- File: resources/views/components/resizable/index.blade.php | Map: props -> div.oc-resizable with <x-oc::resizable.panel> children
     OmniaUI resizable (0.17.0): panels with CSS resize, no JavaScript (same markup as packages/ui/snippets/resizable.html).
     Give it a block-size. Props: vertical (panels on top of each other), box (one box that resizes in both directions). --}}
@props(['vertical' => false, 'box' => false])
<div {{ $attributes->class(['oc-resizable-box' => $box, 'oc-resizable', 'oc-resizable--vertical' => $vertical]) }}>{{ $slot }}</div>
