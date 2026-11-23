{{-- OmniaCSS empty state. Props: title, text, icon (glyph or webicon name), locked (content that opens later: dashed frame,
     a lock icon), meta (what is left, "120 m to go"). Slot: actions (buttons). --}}
@props(['title' => null, 'text' => null, 'icon' => null, 'locked' => false, 'meta' => null])
@php($icon = $icon ?? ($locked ? 'mdi:lock-outline' : '+'))
<div {{ $attributes->class(['oc-empty', 'oc-empty--locked' => $locked]) }}>
    <span class="oc-empty-icon" aria-hidden="true">@if (str_contains((string) $icon, ':'))<x-oc::webicon :name="$icon" bare fallback="iconify" />@else{{ $icon }}@endif</span>
    @if ($title)
        <h3 class="oc-empty-title">{{ $title }}</h3>
    @endif
    @if ($text)
        <p class="oc-empty-text">{{ $text }}</p>
    @endif
    @if ($meta)
        <span class="oc-empty-meta">{{ $meta }}</span>
    @endif
    @if (! $slot->isEmpty())
        <div class="oc-empty-actions">{{ $slot }}</div>
    @endif
</div>
