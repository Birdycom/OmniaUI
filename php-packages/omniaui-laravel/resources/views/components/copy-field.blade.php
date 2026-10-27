{{-- OmniaCSS copy field. Props: value, label (aria-label), button (text). --}}
@props(['value' => '', 'label' => 'Value', 'button' => 'Copy'])
<div {{ $attributes->class(['oc-copy-field']) }}>
    <input class="oc-copy-field-value" type="text" readonly value="{{ $value }}" aria-label="{{ $label }}">
    <button class="oc-copy-field-button" type="button">{{ $button }}</button>
</div>
@once
    <script>
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('.oc-copy-field-button');
            if (!btn) return;
            await navigator.clipboard.writeText(btn.parentElement.querySelector('.oc-copy-field-value').value);
            btn.classList.add('is-copied');
            setTimeout(() => btn.classList.remove('is-copied'), 2000);
        });
    </script>
@endonce
