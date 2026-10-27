{{-- File: resources/views/components/next-teaser.blade.php | Map: props -> a.oc-next-teaser -> label -> name (mark slot) -> tagline
     OmniaUI next teaser. Props: href, label (default "Next product"), name, tagline, prev.
     Slots: mark (e.g. <x-oc::product-mark size="sm" accent="violet">◉</x-oc::product-mark>), default = name. --}}
@props(['href' => '#', 'label' => 'Next product', 'name' => null, 'tagline' => null, 'prev' => false, 'mark' => null])
<a {{ $attributes->class(['oc-next-teaser', 'oc-next-teaser--prev' => $prev])->merge(['href' => $href]) }}>
    @if ($label)
        <span class="oc-next-teaser__label">{{ $label }}</span>
    @endif
    <span class="oc-next-teaser__name">{{ $mark }}{{ $name ?? $slot }}</span>
    @if ($tagline)
        <span class="oc-next-teaser__tagline">{{ $tagline }}</span>
    @endif
</a>
