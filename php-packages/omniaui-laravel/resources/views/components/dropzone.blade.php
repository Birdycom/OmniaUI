{{-- OmniaCSS dropzone. Props: title, hint, accept, multiple. Attributes (name, wire:model, ...) go to the file input. --}}
@props(['title' => 'Drop files here', 'hint' => null, 'accept' => null, 'multiple' => false])
<label class="oc-dropzone">
    <input {{ $attributes->merge(['type' => 'file', 'accept' => $accept]) }} @if ($multiple) multiple @endif>
    <span class="oc-dropzone-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg></span>
    <span><strong>{{ $title }}</strong> {{ $slot }}</span>
    @if ($hint)
        <span class="oc-dropzone-hint">{{ $hint }}</span>
    @endif
</label>
