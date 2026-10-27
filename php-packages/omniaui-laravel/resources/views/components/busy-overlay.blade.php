{{-- File: resources/views/components/busy-overlay.blade.php | Map: props -> <dialog closedby="none"> (spinner or progress, title, text) -> one-time script
     OmniaUI "please wait" overlay. Props: id (required), title, text, progress (0-100: progress bar instead of the spinner),
     label (aria-label of the spinner). Slot: default replaces the text. Put data-oc-busy="<id>" on a form: the script opens
     the overlay when that form is submitted (after the browser's own validation). After a fetch() call close it with dialog.close(). --}}
@props(['id', 'title' => 'Saving…', 'text' => 'The photos are being processed. This can take a minute; please keep this page open.', 'progress' => null, 'label' => 'Busy'])
<dialog {{ $attributes->class(['oc-busy-overlay'])->merge(['id' => $id, 'closedby' => 'none', 'aria-labelledby' => $id.'-title', 'aria-describedby' => $id.'-text']) }}>
    @if ($progress === null)
        <span class="oc-spinner" role="status" aria-label="{{ $label }}"></span>
    @else
        <x-oc::progress :value="$progress" :label="$label" />
    @endif
    <h2 class="oc-busy-overlay__title" id="{{ $id }}-title">{{ $title }}</h2>
    <p class="oc-busy-overlay__text" id="{{ $id }}-text">{{ $slot->isEmpty() ? $text : $slot }}</p>
</dialog>
@once
    <script>
        // Open the busy overlay of a form when it is submitted (the submit event only fires when the form is valid).
        document.addEventListener("submit", (e) => {
            const id = e.target.dataset?.ocBusy;
            if (id) document.getElementById(id)?.showModal();
        });
    </script>
@endonce
