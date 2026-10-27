{{-- File: resources/views/components/barcode-input.blade.php | Map: props -> wrapper -> label + field -> preview figure (slot or placeholder bars)
     OmniaUI barcode input. Props: label, id, name, value, empty (preview text without a code), error.
     Slot `preview`: your own <svg>/<img> barcode instead of the placeholder bars. Attributes go to the input. --}}
@props(['label' => null, 'id' => null, 'name' => 'barcode', 'value' => null, 'empty' => 'No code yet', 'error' => false, 'preview' => null])
@php($id = $id ?: 'oc-barcode-'.substr(md5(uniqid('', true)), 0, 6))
<div class="oc-barcode-input">
    @if ($label)
        <label class="oc-field-label" for="{{ $id }}">{{ $label }}</label>
    @endif
    <div class="oc-input-group oc-input-group--affix">
        <span class="oc-input-addon" aria-hidden="true">
            <svg viewBox="0 0 16 16"><path fill="currentColor" d="M1 1h1.4v14H1zm2.2 0h.7v14h-.7zm1.6 0h1.5v14H4.8zm2.4 0h.7v14H7.2zm1.6 0h.7v14H8.8zm1.5 0h1.4v14h-1.4zm2.2 0H15v14h-.9z"/></svg>
        </span>
        <input {{ $attributes->class(['oc-input', 'oc-barcode-input-field'])->merge([
            'id' => $id,
            'name' => $name,
            'value' => $value,
            'type' => 'text',
            'autocomplete' => 'off',
            'spellcheck' => 'false',
            'maxlength' => '80',
            'placeholder' => 'EAN-13 or internal code',
            'aria-invalid' => $error ? 'true' : null,
        ]) }}>
    </div>
    <figure @class(['oc-barcode-preview', 'oc-barcode-preview--empty' => blank($value)]) aria-label="Barcode preview">
        @if ($preview)
            {{ $preview }}
        @else
            <div class="oc-barcode-preview-bars" aria-hidden="true"></div>
        @endif
        <figcaption class="oc-barcode-preview-code">{{ filled($value) ? $value : $empty }}</figcaption>
    </figure>
</div>
