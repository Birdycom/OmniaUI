{{-- OmniaCSS pagination. Props: paginator (a Laravel paginator) OR current + total + url (sprintf pattern, default "?page=%d"), label, window (pages around current). --}}
@props(['paginator' => null, 'current' => 1, 'total' => 1, 'url' => '?page=%d', 'label' => 'Pagination', 'window' => 2])
@php
    if ($paginator) {
        $current = $paginator->currentPage();
        $total = method_exists($paginator, 'lastPage') ? $paginator->lastPage() : $current;
        $href = fn (int $page): string => $paginator->url($page);
    } else {
        $href = fn (int $page): string => sprintf($url, $page);
    }
    $pages = collect(range(1, max(1, (int) $total)))
        ->filter(fn (int $p) => $p === 1 || $p === (int) $total || abs($p - (int) $current) <= $window)
        ->values();
@endphp
@if ($total > 1)
    <nav {{ $attributes->class(['oc-pagination'])->merge(['aria-label' => $label]) }}>
        @foreach ($pages as $i => $page)
            @if ($i > 0 && $page - $pages[$i - 1] > 1)
                <span class="oc-pagination-item" aria-hidden="true">&hellip;</span>
            @endif
            <a class="oc-pagination-item" href="{{ $href($page) }}" @if ($page === (int) $current) aria-current="page" @endif>{{ $page }}</a>
        @endforeach
    </nav>
@endif
