{{-- File: resources/views/components/accordion-accent.blade.php | Map: div.oc-accordion.oc-accordion--accent (+ color classes) -> <x-oc::accordion.item> entries
     OmniaUI accordion accent: separate item cards with a colored start edge. Needs @birdycom/omniaui CSS.
     Props: accent (blue|cyan|green|orange|red|violet|yellow preset for all items), tone (success|warning|danger), flush.
     Slot: <x-oc::accordion.item> entries. Color one item with class="oc-accent--violet" or "oc-accordion-item--warning". --}}
@props(['accent' => null, 'tone' => null, 'flush' => false])
<div {{ $attributes->class([
    'oc-accordion',
    'oc-accordion--accent',
    'oc-accordion--flush' => $flush,
    'oc-accent--'.$accent => in_array($accent, ['blue', 'cyan', 'green', 'orange', 'red', 'violet', 'yellow'], true),
    'oc-accordion--'.$tone => in_array($tone, ['success', 'warning', 'danger'], true),
]) }}>
    {{ $slot }}
</div>
