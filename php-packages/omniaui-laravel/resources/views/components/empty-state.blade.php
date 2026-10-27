{{-- OmniaCSS empty state. Props: title, text, icon (glyph). Slot: actions (buttons). --}}
@props(['title' => null, 'text' => null, 'icon' => '+'])
<div {{ $attributes->class(['oc-empty']) }}>
    <span class="oc-empty-icon" aria-hidden="true">{{ $icon }}</span>
    @if ($title)
        <h3 class="oc-empty-title">{{ $title }}</h3>
    @endif
    @if ($text)
        <p class="oc-empty-text">{{ $text }}</p>
    @endif
    @if (! $slot->isEmpty())
        <div class="oc-empty-actions">{{ $slot }}</div>
    @endif
</div>
