{{-- File: resources/views/components/marquee.blade.php | Map: props -> .oc-marquee -> track (items + aria-hidden copy)
     OmniaUI marquee. Props: items (strings), label, reverse, speed (default|slow|fast), plain, noFade.
     The items are rendered twice; the copy is aria-hidden. Pauses on hover/focus, static with reduced motion. --}}
@props(['items' => [], 'label' => null, 'reverse' => false, 'speed' => 'default', 'plain' => false, 'noFade' => false])
<div {{ $attributes->class([
    'oc-marquee',
    'oc-marquee--reverse' => $reverse,
    'oc-marquee--'.$speed => in_array($speed, ['slow', 'fast'], true),
    'oc-marquee--plain' => $plain,
    'oc-marquee--no-fade' => $noFade,
])->merge(['aria-label' => $label]) }}>
    <div class="oc-marquee__track">
        @foreach ($items as $item)<span class="oc-marquee__item">{{ $item }}</span>@endforeach
        @foreach ($items as $item)<span class="oc-marquee__item" aria-hidden="true">{{ $item }}</span>@endforeach
    </div>
</div>
