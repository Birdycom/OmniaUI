{{-- OmniaCSS dropzone. Props: title, hint, accept, multiple. Attributes (name, wire:model, ...) go to the file input. --}}
@props(['title' => 'Drop files here', 'hint' => null, 'accept' => null, 'multiple' => false])
<label class="oc-dropzone">
    <input {{ $attributes->merge(['type' => 'file', 'accept' => $accept]) }} @if ($multiple) multiple @endif>
    <span class="oc-dropzone-icon" aria-hidden="true"><svg data-icon="mdi:tray-arrow-up" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 12h2v5h16v-5h2v5c0 1.11-.89 2-2 2H4a2 2 0 0 1-2-2zM12 2L6.46 7.46l1.42 1.42L11 5.75V15h2V5.75l3.13 3.13l1.42-1.43z"/></svg></span>
    <span><strong>{{ $title }}</strong> {{ $slot }}</span>
    @if ($hint)
        <span class="oc-dropzone-hint">{{ $hint }}</span>
    @endif
</label>
