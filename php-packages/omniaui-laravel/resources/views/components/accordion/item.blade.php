{{-- OmniaCSS accordion item. Props: title, name (exclusive group), open. Slot: content. --}}
@props(['title', 'name' => 'oc-accordion', 'open' => false])
<details {{ $attributes->class(['oc-accordion-item'])->merge(['name' => $name]) }} @if ($open) open @endif>
    <summary class="oc-accordion-trigger">{{ $title }}</summary>
    <div class="oc-accordion-content">{{ $slot }}</div>
</details>
