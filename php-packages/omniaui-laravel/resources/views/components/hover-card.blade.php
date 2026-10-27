{{-- OmniaCSS hover card (interestfor + popover). Props: label (trigger text), href, id, top, sm. Slots: default = card content, trigger (replaces the link). --}}
@props(['label' => null, 'href' => '#', 'id' => null, 'top' => false, 'sm' => false])
@php($id = $id ?: 'oc-hc-'.substr(md5(uniqid('', true)), 0, 6))
<span {{ $attributes->class(['oc-hover-card', 'oc-hover-card--top' => $top]) }}>
    @if (isset($trigger) && trim((string) $trigger) !== '')
        {{ $trigger }}
    @else
        <a class="oc-hover-card-trigger" href="{{ $href }}" interestfor="{{ $id }}">{{ $label }}</a>
    @endif
    <div @class(['oc-hover-card-content', 'oc-hover-card-content--sm' => $sm]) id="{{ $id }}" popover>{{ $slot }}</div>
</span>
