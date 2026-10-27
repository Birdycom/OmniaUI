{{-- OmniaCSS modal on <dialog>. Props: id (required), title, description, size (sm|lg|xl|full), closedby.
     Slots: default = body, footer (buttons), trigger (rendered before the dialog). Buttons use command="show-modal|close" commandfor="{id}". --}}
@props(['id', 'title' => null, 'description' => null, 'size' => null, 'closedby' => 'any'])
@if (isset($trigger) && trim((string) $trigger) !== '')
    {{ $trigger }}
@endif
<dialog {{ $attributes->class(['oc-modal'])->merge(['id' => $id, 'closedby' => $closedby, 'aria-labelledby' => $id.'-title']) }}>
    <div @class(['oc-modal-content', 'oc-modal-content--'.$size => $size])>
        @if ($title || $description)
            <div class="oc-modal-header">
                @if ($title)
                    <h2 class="oc-modal-title" id="{{ $id }}-title">{{ $title }}</h2>
                @endif
                @if ($description)
                    <p class="oc-modal-description">{{ $description }}</p>
                @endif
            </div>
        @endif
        @if (! $slot->isEmpty())
            <div class="oc-modal-body">{{ $slot }}</div>
        @endif
        @if (isset($footer) && trim((string) $footer) !== '')
            <div class="oc-modal-footer">{{ $footer }}</div>
        @endif
    </div>
</dialog>
