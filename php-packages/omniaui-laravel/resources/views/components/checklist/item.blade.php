{{-- OmniaCSS checklist item. Props: done, title, hint. Slot: label (or action markup in card lists). --}}
@props(['done' => false, 'title' => null, 'hint' => null])
<li {{ $attributes->class(['oc-checklist-item', 'is-done' => $done]) }}>
    @if ($title || $hint)
        <span class="oc-checklist-text">
            <span class="oc-checklist-title">{{ $title }}</span>
            @if ($hint)
                <span class="oc-checklist-hint">{{ $hint }}</span>
            @endif
        </span>
    @endif
    {{ $slot }}
</li>
