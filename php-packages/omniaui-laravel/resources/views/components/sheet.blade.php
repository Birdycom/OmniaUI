{{-- OmniaCSS sheet (side panel on <dialog>). Props: id (required), side (right|left|top|bottom), wide, title, description, closedby, close (aria-label).
     Slots: default = body, footer, trigger (rendered before the dialog). --}}
@props(['id', 'side' => 'right', 'wide' => false, 'title' => null, 'description' => null, 'closedby' => 'any', 'close' => 'Close'])
@if (isset($trigger) && trim((string) $trigger) !== '')
    {{ $trigger }}
@endif
<dialog {{ $attributes->class(['oc-sheet', 'oc-sheet--'.$side => $side && $side !== 'right'])->merge(['id' => $id, 'closedby' => $closedby, 'aria-labelledby' => $id.'-title']) }}>
    <div @class(['oc-sheet-content', 'oc-sheet-content--wide' => $wide])>
        <button class="oc-sheet-close" type="button" command="close" commandfor="{{ $id }}" aria-label="{{ $close }}">&times;</button>
        @if ($title || $description)
            <div class="oc-sheet-header">
                @if ($title)
                    <h2 class="oc-sheet-title" id="{{ $id }}-title">{{ $title }}</h2>
                @endif
                @if ($description)
                    <p class="oc-sheet-description">{{ $description }}</p>
                @endif
            </div>
        @endif
        <div class="oc-sheet-body">{{ $slot }}</div>
        @if (isset($footer) && trim((string) $footer) !== '')
            <div class="oc-sheet-footer">{{ $footer }}</div>
        @endif
    </div>
</dialog>
