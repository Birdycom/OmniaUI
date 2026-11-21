{{-- File: resources/views/components/glass-bar.blade.php | Map: props -> nav.oc-glass-bar -> items (icon, label)
     OmniaUI liquid glass menu bar. Props: items (array of ['label', 'icon' (webicon name), 'href', 'current']),
     icons (icons only), label (accessible name). ['sep' => true] in items draws a thin divider (.oc-glass-bar__sep).
     Without items the slot is used. lens (default true; false sets data-oc-glass-lens="off"): the lens needs
     /js/oc-glass-lens.js once in the layout (npx omniaui copy-js glass-lens); without it the bar is frosted glass. --}}
@props(['items' => [], 'icons' => false, 'label' => 'Main', 'lens' => true])
<nav {{ $attributes->class(['oc-glass-bar', 'oc-glass-bar--icons' => $icons])->merge($lens ? [] : ['data-oc-glass-lens' => 'off']) }} aria-label="{{ $label }}">
    @forelse ($items as $item)
        @if (! empty($item['sep']))
        <span class="oc-glass-bar__sep" aria-hidden="true"></span>
        @else
        <a class="oc-glass-bar__item" href="{{ $item['href'] ?? '#' }}" @if(! empty($item['current'])) aria-current="page" @endif @if($icons) aria-label="{{ $item['label'] }}" @endif>@if (! empty($item['icon']))<x-oc::webicon :name="$item['icon']" bare fallback="iconify" />@endif @unless($icons)<span>{{ $item['label'] }}</span>@endunless</a>
        @endif
    @empty
        {{ $slot }}
    @endforelse
</nav>
