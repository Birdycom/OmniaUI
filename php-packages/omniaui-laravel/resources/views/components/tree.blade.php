{{-- File: resources/views/components/tree.blade.php | Map: box (+ head row) -> list -> item: folder (details/summary + nested list) or leaf (div row)
     OmniaUI tree: nested list on details / summary, no JavaScript. Needs @birdycom/omniaui CSS.
     Props: items (nested list of ['label', 'href', 'count', 'children', 'open', 'current', 'muted']),
            head (sticky root row label), quiet, flush, nested (internal: render only the list).
     Slot: head actions (shown in the head row). --}}
@props(['items' => [], 'head' => null, 'quiet' => false, 'flush' => false, 'nested' => false])
@if ($nested)
    <ul class="oc-tree-list">
        @foreach ($items as $item)
            @php($current = ! empty($item['current']))
            @php($href = $item['href'] ?? null)
            <li>
                @if (! empty($item['children']))
                    <details class="oc-tree-node" @if (! empty($item['open'])) open @endif>
                        <summary @class(['oc-tree-row', 'is-muted' => ! empty($item['muted'])]) @if ($current) aria-current="true" @endif><span class="oc-tree-label">{{ $item['label'] }}</span>@isset($item['count'])<span class="oc-tree-count">{{ $item['count'] }}</span>@endisset</summary>
                        <x-oc::tree :items="$item['children']" nested />
                    </details>
                @else
                    <div @class(['oc-tree-row', 'is-muted' => ! empty($item['muted'])]) @if ($current && ! $href) aria-current="true" @endif>
                        @if ($href)
                            <a class="oc-tree-label" href="{{ $href }}" @if ($current) aria-current="true" @endif>{{ $item['label'] }}</a>
                        @else
                            <span class="oc-tree-label">{{ $item['label'] }}</span>
                        @endif
                        @isset($item['count'])<span class="oc-tree-count">{{ $item['count'] }}</span>@endisset
                    </div>
                @endif
            </li>
        @endforeach
    </ul>
@else
    <div {{ $attributes->class(['oc-tree', 'oc-tree--quiet' => $quiet, 'oc-tree--flush' => $flush]) }}>
        @if ($head)
            <div class="oc-tree-row oc-tree-head"><span class="oc-tree-label">{{ $head }}</span>@if (! $slot->isEmpty())<span class="oc-tree-actions">{{ $slot }}</span>@endif</div>
        @endif
        <x-oc::tree :items="$items" nested />
    </div>
@endif
