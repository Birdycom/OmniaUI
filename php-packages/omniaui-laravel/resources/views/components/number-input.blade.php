{{-- File: resources/views/components/number-input.blade.php | Map: props -> frame (minus, number field, plus) -> one-time script
     OmniaUI number input. Props: name, value, size (sm), block, error, decrement / increment (button labels).
     Attributes (min, max, step, wire:model, aria-label...) go to the input. --}}
@props(['name' => null, 'value' => null, 'size' => null, 'block' => false, 'error' => false, 'decrement' => 'Decrease', 'increment' => 'Increase'])
<div @class(['oc-number-input', 'oc-number-input--sm' => $size === 'sm', 'oc-number-input--block' => $block, 'oc-number-input--error' => $error])>
    <button class="oc-number-input-step" type="button" data-oc-step="-1" aria-label="{{ $decrement }}">&minus;</button>
    <input {{ $attributes->class(['oc-number-input-field'])->merge(['type' => 'number', 'name' => $name, 'value' => $value, 'aria-invalid' => $error ? 'true' : null]) }}>
    <button class="oc-number-input-step" type="button" data-oc-step="1" aria-label="{{ $increment }}">+</button>
</div>
@once
    <script>
        // One listener for every number input: stepUp/stepDown respect min, max and step.
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.oc-number-input-step');
            if (!btn) return;
            const input = btn.parentElement.querySelector('.oc-number-input-field');
            if (!input || input.disabled) return;
            btn.dataset.ocStep === '-1' ? input.stepDown() : input.stepUp();
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    </script>
@endonce
