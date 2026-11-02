{{-- File: resources/views/components/glass-bar.blade.php | Map: props -> nav.oc-glass-bar -> items (icon, label)
     OmniaUI liquid glass menu bar. Props: items (array of ['label', 'icon' (webicon name), 'href', 'current']),
     icons (icons only), label (accessible name). Without items the slot is used. --}}
@props(['items' => [], 'icons' => false, 'label' => 'Main'])
<nav {{ $attributes->class(['oc-glass-bar', 'oc-glass-bar--icons' => $icons]) }} aria-label="{{ $label }}">
    @forelse ($items as $item)
        <a class="oc-glass-bar__item" href="{{ $item['href'] ?? '#' }}" @if(! empty($item['current'])) aria-current="page" @endif @if($icons) aria-label="{{ $item['label'] }}" @endif>@if (! empty($item['icon']))<iconify-icon icon="{{ $item['icon'] }}" aria-hidden="true"></iconify-icon>@endif @unless($icons)<span>{{ $item['label'] }}</span>@endunless</a>
    @empty
        {{ $slot }}
    @endforelse
</nav>
