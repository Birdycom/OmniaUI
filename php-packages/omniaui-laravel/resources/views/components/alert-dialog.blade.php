{{-- OmniaCSS alert dialog (confirmation modal on <dialog>).
     Props: id (required), type (success|error|warning|info|question), title, icon (glyph, default per type),
            cancel (label), confirm (label), confirmVariant (button variant), closedby.
     Slots: default = message, footer = replaces both buttons. Open it with a button: command="show-modal" commandfor="{id}". --}}
@props([
    'id',
    'type' => 'warning',
    'title' => null,
    'icon' => null,
    'cancel' => 'Cancel',
    'confirm' => 'Confirm',
    'confirmVariant' => 'destructive',
    'closedby' => 'closerequest',
])
@php
    $glyph = $icon ?? match ($type) {
        'success' => '✓',
        'error' => '×',
        'question' => '?',
        'info' => 'i',
        default => '!',
    };
    $confirmClass = in_array($confirmVariant, ['primary', 'default'], true) ? 'oc-btn' : 'oc-btn oc-btn--'.$confirmVariant;
@endphp
<dialog {{ $attributes->class(['oc-modal'])->merge(['id' => $id, 'closedby' => $closedby, 'aria-labelledby' => $id.'-title', 'aria-describedby' => $id.'-text']) }}>
    <div class="oc-modal-content oc-modal-content--sm oc-alert-dialog oc-alert-dialog--{{ $type }}">
        <span class="oc-alert-dialog-icon" aria-hidden="true">{{ $glyph }}</span>
        <h2 class="oc-modal-title" id="{{ $id }}-title">{{ $title }}</h2>
        <div class="oc-modal-body" id="{{ $id }}-text">{{ $slot }}</div>
        <div class="oc-modal-footer">
            @if (isset($footer) && trim((string) $footer) !== '')
                {{ $footer }}
            @else
                <button class="oc-btn oc-btn--outline" type="button" command="close" commandfor="{{ $id }}">{{ $cancel }}</button>
                <button class="{{ $confirmClass }}" type="button" command="close" commandfor="{{ $id }}">{{ $confirm }}</button>
            @endif
        </div>
    </div>
</dialog>
