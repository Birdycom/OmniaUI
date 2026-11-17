{{-- OmniaCSS copy field. Props: value, label (aria-label), button (text), display (true | 'lg': large centred code), group
     (show it in groups of n; the raw value is copied), caption (a line under the code). --}}
@props(['value' => '', 'label' => 'Value', 'button' => 'Copy', 'display' => false, 'group' => null, 'caption' => null])
@php($shown = $group ? implode(' ', mb_str_split((string) $value, (int) $group)) : (string) $value)
<div {{ $attributes->class(['oc-copy-field', 'oc-copy-field--display' => $display, 'oc-copy-field--lg' => $display === 'lg'])->merge(array_filter(['style' => $display ? '--oc-copy-chars: '.mb_strlen($shown) : null])) }}>
    <input class="oc-copy-field-value" type="text" readonly value="{{ $shown }}" aria-label="{{ $label }}">
    <button class="oc-copy-field-button" type="button" @if ($group) data-copy="{{ $value }}" @endif>{{ $button }}</button>
    @if ($caption)<p class="oc-copy-field-caption">{{ $caption }}</p>@endif
</div>
@once
    <script>
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('.oc-copy-field-button');
            if (!btn) return;
            await navigator.clipboard.writeText(btn.dataset.copy ?? btn.parentElement.querySelector('.oc-copy-field-value').value);
            btn.classList.add('is-copied');
            setTimeout(() => btn.classList.remove('is-copied'), 2000);
        });
    </script>
@endonce
