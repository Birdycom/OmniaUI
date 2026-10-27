{{-- File: resources/views/components/confirm-dialog.blade.php | Map: dialog.oc-modal -> confirm content (close X, icon ring, title) -> form (message, typed field, footer: discard, cancel, confirm)
     OmniaUI confirm dialog (alert dialog variant). Needs @birdycom/omniaui CSS. No JavaScript: open with
     command="show-modal" commandfor="{id}". The confirm button submits; with method="dialog" it just closes,
     with action + method="post" it posts the form (CSRF added).
     Props: id (required), type (success|error|warning|info|question, default error), title, icon, cancel, confirm, discard (labels),
            word (typed confirmation, e.g. DELETE), action, method (dialog|post|get), name (confirm button value name).
     Slot: default = message. --}}
@props([
    'id',
    'type' => 'error',
    'title' => null,
    'icon' => null,
    'cancel' => 'Cancel',
    'confirm' => 'Confirm',
    'discard' => null,
    'word' => null,
    'action' => null,
    'method' => 'dialog',
])
@php
    $glyph = $icon ?? match ($type) { 'success' => '✓', 'error' => '×', 'question' => '?', 'info' => 'i', default => '!' };
    $confirmClass = $type === 'error' ? 'oc-btn oc-btn--destructive' : 'oc-btn';
@endphp
<dialog {{ $attributes->class(['oc-modal'])->merge(['id' => $id, 'closedby' => 'any', 'aria-labelledby' => $id.'-title', 'aria-describedby' => $id.'-text']) }}>
    <div class="oc-modal-content oc-alert-dialog oc-alert-dialog--{{ $type }} oc-alert-dialog--confirm">
        <button class="oc-alert-dialog-close" type="button" command="close" commandfor="{{ $id }}" aria-label="Close">&times;</button>
        <span class="oc-alert-dialog-icon" aria-hidden="true">{{ $glyph }}</span>
        <h2 class="oc-modal-title" id="{{ $id }}-title">{{ $title }}</h2>
        <form class="oc-alert-dialog-form" method="{{ $method }}" @if ($action) action="{{ $action }}" @endif>
            @if (strtolower($method) === 'post') @csrf @endif
            <div class="oc-modal-body" id="{{ $id }}-text">{{ $slot }}</div>
            @if ($word)
                <label class="oc-alert-dialog-typed">
                    <span>Type <code>{{ $word }}</code> to confirm</span>
                    <input class="oc-input" name="confirm" pattern="{{ $word }}" required autocomplete="off">
                </label>
            @endif
            <div class="oc-modal-footer">
                @if ($discard)
                    <button class="oc-btn oc-btn--ghost oc-alert-dialog-discard" type="submit" value="discard" formnovalidate>{{ $discard }}</button>
                @endif
                <button class="oc-btn oc-btn--outline" type="button" command="close" commandfor="{{ $id }}">{{ $cancel }}</button>
                <button class="{{ $confirmClass }} oc-alert-dialog-confirm" type="submit" value="confirm">{{ $confirm }}</button>
            </div>
        </form>
    </div>
</dialog>
