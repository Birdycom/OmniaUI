{{-- File: resources/views/components/alpha-tabs.blade.php | Map: nav -> "All" link -> one link per letter (current / disabled)
     OmniaUI alpha tabs: All + A-Z letter filter (links, server-side filtering). Needs @birdycom/omniaui CSS.
     Props: current (letter or 'all'), available (letters with entries; others disabled; null = all),
            href (pattern with {letter}, default "?letter={letter}"), letters (default A-Z), all (label), wrap, size ('sm'), plain. --}}
@props([
    'current' => 'all',
    'available' => null,
    'href' => '?letter={letter}',
    'letters' => range('A', 'Z'),
    'all' => 'All',
    'wrap' => false,
    'size' => null,
    'plain' => false,
])
<nav {{ $attributes->class(['oc-alpha-tabs', 'oc-alpha-tabs--wrap' => $wrap, 'oc-alpha-tabs--sm' => $size === 'sm', 'oc-alpha-tabs--plain' => $plain])->merge(['aria-label' => 'Filter by letter']) }}>
    <a class="oc-alpha-tabs-item oc-alpha-tabs-item--all" href="{{ str_replace('{letter}', 'all', $href) }}" @if ($current === 'all') aria-current="true" @endif>{{ $all }}</a>
    @foreach ($letters as $letter)
        @if (is_array($available) && ! in_array($letter, $available, true))
            {{-- No entries: no href, so the link cannot be followed. --}}
            <a class="oc-alpha-tabs-item" aria-disabled="true">{{ $letter }}</a>
        @else
            <a class="oc-alpha-tabs-item" href="{{ str_replace('{letter}', $letter, $href) }}" @if ($current === $letter) aria-current="true" @endif>{{ $letter }}</a>
        @endif
    @endforeach
</nav>
