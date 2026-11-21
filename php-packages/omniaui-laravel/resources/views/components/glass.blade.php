{{-- File: resources/views/components/glass.blade.php | Map: props -> .oc-glass sheet -> slot
     OmniaUI glass: see-through sheet with a light top edge; .oc-card inside becomes a glass panel.
     Props: strong (more opaque), flat (desktop window where the OS draws the blur), liquid (liquid glass), as (div|section|aside|article|main),
     lens (default true; false sets data-oc-glass-lens="off"), draggable (data-oc-glass-drag: people move the sheet over its
     backdrop with the mouse, a finger or the arrow keys, inside its parent). The lens (the backdrop bends at the edge,
     Chromium only) and the drag need /js/oc-glass-lens.js once in the layout: npx omniaui copy-js glass-lens, then
     <script type="module" src="/js/oc-glass-lens.js"></script>. Without it, and in other browsers, the sheet is frosted glass. --}}
@props(['strong' => false, 'flat' => false, 'liquid' => false, 'lens' => true, 'draggable' => false, 'as' => 'div'])
<{{ $as }} {{ $attributes->class(['oc-glass', 'oc-glass--strong' => $strong, 'oc-glass--flat' => $flat, 'oc-glass--liquid' => $liquid])->merge(array_merge($lens ? [] : ['data-oc-glass-lens' => 'off'], $draggable ? ['data-oc-glass-drag' => ''] : [])) }}>{{ $slot }}</{{ $as }}>
