{{-- OmniaCSS password input with show/hide button. Props: label, id, name, error, show/hide (button texts). Attributes go to the input. --}}
@props(['label' => null, 'id' => null, 'name' => 'password', 'error' => false, 'show' => 'Show', 'hide' => 'Hide'])
@php($id = $id ?: 'oc-password-'.substr(md5(uniqid('', true)), 0, 6))
<div class="oc-field">
    @if ($label)
        <label class="oc-field-label" for="{{ $id }}">{{ $label }}</label>
    @endif
    <div class="oc-input-reveal">
        <input {{ $attributes->class(['oc-input', 'oc-input--error' => $error])->merge(['id' => $id, 'name' => $name, 'type' => 'password', 'autocomplete' => 'current-password']) }}>
        <button class="oc-input-reveal-button" type="button" aria-pressed="false" aria-label="Toggle password visibility" data-show="{{ $show }}" data-hide="{{ $hide }}">{{ $show }}</button>
    </div>
</div>
@once
    <script>
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.oc-input-reveal-button');
            if (!btn) return;
            const input = btn.parentElement.querySelector('input');
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            btn.setAttribute('aria-pressed', String(show));
            btn.textContent = show ? (btn.dataset.hide || 'Hide') : (btn.dataset.show || 'Show');
        });
    </script>
@endonce
