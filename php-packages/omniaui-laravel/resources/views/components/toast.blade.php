{{-- OmniaCSS toast. Props: variant (success|error|warning|info), title, icon (glyph, default per variant), dismissible, auto (CSS auto-dismiss),
     action (0.18.0: the label of a button in the toast, e.g. "Undo"). Slots: description (default), action (your own button markup;
     give it class="oc-toast-action", e.g. wire:click="undo"). --}}
@props(['variant' => 'info', 'title' => null, 'icon' => null, 'dismissible' => true, 'auto' => false, 'action' => null])
@php
    $glyph = $icon ?? match ($variant) {
        'success' => '✓',
        'info' => 'i',
        default => '!',
    };
@endphp
<div {{ $attributes->class(['oc-toast', 'oc-toast--'.$variant => $variant, 'oc-toast--auto' => $auto])->merge(['role' => $variant === 'error' ? 'alert' : 'status']) }}>
    <span class="oc-toast-icon" aria-hidden="true">{{ $glyph }}</span>
    <div class="oc-toast-body">
        @if ($title)
            <p class="oc-toast-title">{{ $title }}</p>
        @endif
        @if (! $slot->isEmpty())
            <p class="oc-toast-description">{{ $slot }}</p>
        @endif
    </div>
    @if ($action instanceof \Illuminate\View\ComponentSlot)
        {{ $action }}
    @elseif ($action)
        <button class="oc-toast-action" type="button">{{ $action }}</button>
    @endif
    @if ($dismissible)
        <button class="oc-toast-close" type="button" aria-label="Dismiss">&times;</button>
    @endif
</div>
