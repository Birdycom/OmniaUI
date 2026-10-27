{{-- File: resources/views/components/password-requirements.blade.php | Map: props -> rule list -> one-time live script
     OmniaUI password requirements. Props: for (id of the password input to watch), inline,
     rules (list of ['label' => ..., 'min' => 8] or ['label' => ..., 'pattern' => '[A-Z]'], optional 'met' => true for the server state).
     Attributes go to the list. --}}
@props([
    'for' => null,
    'inline' => false,
    'rules' => [
        ['label' => 'At least 8 characters', 'min' => 8],
        ['label' => 'One uppercase letter', 'pattern' => '[A-Z]'],
        ['label' => 'One number', 'pattern' => '[0-9]'],
        ['label' => 'One symbol', 'pattern' => '[^A-Za-z0-9]'],
    ],
])
<ul {{ $attributes->class(['oc-password-requirements', 'oc-password-requirements--inline' => $inline])->merge(['aria-live' => 'polite', 'data-oc-password-for' => $for]) }}>
    @foreach ($rules as $rule)
        <li @class(['oc-password-requirement', 'oc-password-requirement--met' => $rule['met'] ?? false]) @isset($rule['min']) data-min="{{ $rule['min'] }}" @endisset @isset($rule['pattern']) data-pattern="{{ $rule['pattern'] }}" @endisset>{{ $rule['label'] }}</li>
    @endforeach
</ul>
@once
    <script>
        // Re-check every rule of a linked list when its password field changes.
        document.addEventListener('input', (e) => {
            const list = e.target.id && document.querySelector(`[data-oc-password-for="${e.target.id}"]`);
            if (!list) return;
            for (const rule of list.querySelectorAll('.oc-password-requirement')) {
                const value = e.target.value;
                const met = rule.dataset.min ? value.length >= Number(rule.dataset.min) : new RegExp(rule.dataset.pattern).test(value);
                rule.classList.toggle('oc-password-requirement--met', met);
            }
        });
    </script>
@endonce
