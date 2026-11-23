{{-- OmniaCSS checklist. Props: items (list of strings or ['label'|'title', 'done', 'hint', 'href', 'action']), card (bordered rows), label.
     Or use the slot with <x-oc::checklist.item>.
     variant="check" (0.17.0): the short showcase list with a check mark before every line (ul.oc-check-list); items are the lines. --}}
@props(['items' => [], 'card' => false, 'label' => null, 'variant' => 'default'])
@if ($variant === 'check')
<ul {{ $attributes->class(['oc-check-list'])->merge(array_filter(['aria-label' => $label])) }}>
    @foreach ($items as $item)
        <li>{{ is_array($item) ? ($item['label'] ?? $item['title'] ?? '') : $item }}</li>
    @endforeach
    {{ $slot }}
</ul>
@else
<ul {{ $attributes->class(['oc-checklist', 'oc-checklist--card' => $card])->merge(['aria-live' => 'polite', 'aria-label' => $label]) }}>
    @foreach ($items as $item)
        @php($item = is_array($item) ? $item : ['label' => $item])
        <li @class(['oc-checklist-item', 'is-done' => ! empty($item['done'])])>
            @if (! empty($item['hint']))
                <span class="oc-checklist-text"><span class="oc-checklist-title">{{ $item['title'] ?? $item['label'] ?? '' }}</span><span class="oc-checklist-hint">{{ $item['hint'] }}</span></span>
            @else
                {{ $item['label'] ?? $item['title'] ?? '' }}
            @endif
            @if (! empty($item['href']))
                <a class="oc-btn oc-btn--outline oc-btn--sm" href="{{ $item['href'] }}">{{ $item['action'] ?? 'Open' }}</a>
            @endif
        </li>
    @endforeach
    {{ $slot }}
</ul>
@endif
