{{-- OmniaCSS color field (native picker + hex text input). Props: label, id, name, value. Attributes go to the text input. --}}
@props(['label' => null, 'id' => null, 'name' => null, 'value' => null])
@php($id = $id ?: 'oc-color-'.substr(md5(uniqid('', true)), 0, 6))
<div class="oc-field">
    @if ($label)
        <label class="oc-field-label" for="{{ $id }}">{{ $label }}</label>
    @endif
    <div class="oc-color-field">
        <input type="color" @if ($value) value="{{ $value }}" @endif aria-label="Pick a color">
        <input {{ $attributes->merge(['class' => 'oc-input', 'type' => 'text', 'id' => $id, 'name' => $name, 'value' => $value, 'aria-label' => $label ?? 'Color value']) }}>
    </div>
</div>
@once
    <script>
        document.addEventListener('input', (e) => {
            const field = e.target.closest('.oc-color-field');
            if (!field) return;
            const picker = field.querySelector('input[type=color]');
            const text = field.querySelector('input.oc-input');
            if (e.target === picker) { text.value = picker.value; text.dispatchEvent(new Event('input', { bubbles: true })); }
            else if (/^#[0-9a-fA-F]{6}$/.test(text.value)) { picker.value = text.value; }
        });
    </script>
@endonce
