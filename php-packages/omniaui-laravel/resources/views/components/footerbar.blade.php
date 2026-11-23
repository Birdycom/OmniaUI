{{-- File: resources/views/components/footerbar.blade.php | Map: footer.oc-footerbar -> text (slot; in a span with links) -> ul.oc-footerbar-links
     OmniaUI footer bar (packages/ui/snippets/site-footer.html). Needs @birdycom/omniaui CSS.
     Props: links (list of ['href', 'label'] or href => label), links-label (aria-label of the list), fixed, split, tall, dark.
     Slot: the version or copyright line. --}}
@props(['links' => [], 'linksLabel' => null, 'fixed' => false, 'split' => false, 'tall' => false, 'dark' => false])
@php
    $list = collect($links)->map(fn ($l, $k) => is_array($l) ? $l : ['href' => $k, 'label' => $l])->values();
@endphp
<footer {{ $attributes->class(['oc-footerbar', 'oc-footerbar--dark' => $dark, 'oc-footerbar--split' => $split, 'oc-footerbar--tall' => $tall, 'oc-footerbar--fixed' => $fixed]) }}>
    @if ($list->isNotEmpty())
        <span>{{ $slot }}</span>
        <ul class="oc-footerbar-links" @if ($linksLabel) aria-label="{{ $linksLabel }}" @endif>
            @foreach ($list as $link)
                <li><a href="{{ $link['href'] }}">{{ $link['label'] }}</a></li>
            @endforeach
        </ul>
    @else
        {{ $slot }}
    @endif
</footer>
