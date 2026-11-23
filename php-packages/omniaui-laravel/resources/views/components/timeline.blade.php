{{-- File: resources/views/components/timeline.blade.php | Map: props -> ol.oc-timeline -> items -> default slot
     OmniaUI timeline. Props: items (array of ['date', 'datetime'?, 'title'?, 'text'?, 'current'?]), size (default|lg), accent (bool),
     compact (rows <li><strong>date</strong><span>text</span></li>: no dot, no title).
     Slot: default = extra <li class="oc-timeline__item"> entries. --}}
@props(['items' => [], 'size' => 'default', 'accent' => false, 'compact' => false])
<ol {{ $attributes->class(['oc-timeline', 'oc-timeline--lg' => $size === 'lg', 'oc-timeline--accent' => $accent]) }}>
    @if ($compact)
        @foreach ($items as $item)
            <li><strong>{{ $item['date'] }}</strong><span>{{ $item['text'] ?? $item['title'] ?? '' }}</span></li>
        @endforeach
    @endif
    @foreach ($compact ? [] : $items as $item)
        <li @class(['oc-timeline__item', 'oc-timeline__item--current' => ! empty($item['current'])])>
            @if (! empty($item['datetime']))
                <time class="oc-timeline__date" datetime="{{ $item['datetime'] }}">{{ $item['date'] }}</time>
            @else
                <span class="oc-timeline__date">{{ $item['date'] }}</span>
            @endif
            @if (! empty($item['title']))
                <h3 class="oc-timeline__title">{{ $item['title'] }}</h3>
            @endif
            @if (! empty($item['text']))
                <p class="oc-timeline__text">{{ $item['text'] }}</p>
            @endif
        </li>
    @endforeach
    {{ $slot }}
</ol>
