{{-- File: resources/views/components/toc.blade.php | Map: nav.oc-toc -> title -> groups (label + list) or one list -> slot
     OmniaUI table of contents ("On this page", packages/ui/snippets/toc.html; groups as in doc-layout.html). Needs @birdycom/omniaui CSS.
     Props: items (list of ['href' => '#install', 'label', 'sub' => bool, 'current' => bool]), groups (list of ['label', 'items']),
            title (small heading), label (aria-label, default "On this page"), line (reading line of the scroll-spy, 0.35).
     Scroll-spy: load toc.js (npx omniaui copy-js toc); aria-current then follows the heading you read. Slot: extra markup. --}}
@props(['items' => null, 'groups' => [], 'title' => null, 'label' => 'On this page', 'line' => null])
<nav {{ $attributes->class(['oc-toc'])->merge(['aria-label' => $label, 'data-oc-toc-line' => $line]) }}>
    @if ($title)
        <p class="oc-toc-title">{{ $title }}</p>
    @endif
    @foreach (array_merge($groups ?? [], $items !== null ? [['label' => null, 'items' => $items]] : []) as $group)
        @if ($group['label'] !== null)
            <p class="oc-toc-group-label">{{ $group['label'] }}</p>
        @endif
        <ul class="oc-toc-list">
            @foreach ($group['items'] as $item)
                <li @if (! empty($item['sub'])) class="oc-toc-item--sub" @endif><a class="oc-toc-link" href="{{ $item['href'] }}" @if (! empty($item['current'])) aria-current="true" @endif>{{ $item['label'] }}</a></li>
            @endforeach
        </ul>
    @endforeach
    {{ $slot }}
</nav>
