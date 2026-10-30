{{-- File: resources/views/components/glass.blade.php | Map: props -> .oc-glass sheet -> slot
     OmniaUI glass: see-through sheet with a light top edge; .oc-card inside becomes a glass panel.
     Props: strong (more opaque), flat (desktop window where the OS draws the blur), as (div|section|aside|article|main). --}}
@props(['strong' => false, 'flat' => false, 'as' => 'div'])
<{{ $as }} {{ $attributes->class(['oc-glass', 'oc-glass--strong' => $strong, 'oc-glass--flat' => $flat]) }}>{{ $slot }}</{{ $as }}>
