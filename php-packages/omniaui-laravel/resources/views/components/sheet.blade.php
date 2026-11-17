{{-- OmniaCSS sheet (side panel on <dialog>). Props: id (required), side (right|left|top|bottom), wide, title, description, closedby, close (aria-label),
     glass (see-through panel, light scrim without blur), inset (a strip of the page stays free beside the panel),
     footer-panel (the footer is a block of content on its own background), close-round (round close button), close-class
     (extra class on the close button).
     Slots: default = body, footer, trigger (rendered before the dialog). --}}
@props(['id', 'side' => 'right', 'wide' => false, 'title' => null, 'description' => null, 'closedby' => 'any', 'close' => 'Close', 'glass' => false, 'inset' => false, 'footerPanel' => false, 'closeRound' => false, 'closeClass' => null])
@if (isset($trigger) && trim((string) $trigger) !== '')
    {{ $trigger }}
@endif
<dialog {{ $attributes->class(['oc-sheet', 'oc-sheet--'.$side => $side && $side !== 'right', 'oc-sheet--glass' => $glass, 'oc-sheet--inset' => $inset])->merge(['id' => $id, 'closedby' => $closedby, 'aria-labelledby' => $id.'-title']) }}>
    <div @class(['oc-sheet-content', 'oc-sheet-content--wide' => $wide])>
        <button @class(['oc-sheet-close', 'oc-close--round' => $closeRound, $closeClass => $closeClass]) type="button" command="close" commandfor="{{ $id }}" aria-label="{{ $close }}">&times;</button>
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
            <div @class(['oc-sheet-footer', 'oc-sheet-footer--panel' => $footerPanel])>{{ $footer }}</div>
        @endif
    </div>
</dialog>
