{{-- OmniaCSS copy field. Props: value, label / ariaLabel (aria-label of the value, default "Value"; aria-label="..."
     works too), button (text), copiedLabel (feedback after copying, also in a live region; default "Copied"), display
     (true | 'lg': large centred code), group (show it in groups of n; the raw value is copied), caption (a line under the
     code), masked (a secret as dots with a show/hide toggle, aria-pressed), revealLabel (name of that toggle), wrap (long
     values break over lines; not with masked), icon (mdi:content-copy on the button, default true). --}}
@props(['value' => '', 'label' => null, 'ariaLabel' => null, 'button' => 'Copy', 'copiedLabel' => 'Copied', 'display' => false, 'group' => null, 'caption' => null, 'masked' => false, 'revealLabel' => 'Show value', 'wrap' => false, 'icon' => true, 'block' => false])
@php
    $shown = $group ? implode(' ', mb_str_split((string) $value, (int) $group)) : (string) $value;
    $name = $ariaLabel ?? $label ?? 'Value';
    $wraps = $wrap && ! $masked;
    $valueId = 'oc-copy-'.substr(md5(uniqid('', true)), 0, 6);
@endphp
<div {{ $attributes->class(['oc-copy-field', 'oc-copy-field--display' => $display, 'oc-copy-field--lg' => $display === 'lg', 'oc-copy-field--wrap' => $wraps, 'oc-copy-field--block' => $block])->merge(array_filter(['style' => $display ? '--oc-copy-chars: '.mb_strlen($shown) : null])) }}>
    @if ($wraps)
        <output id="{{ $valueId }}" class="oc-copy-field-value" aria-label="{{ $name }}">{{ $shown }}</output>
    @else
        <input id="{{ $valueId }}" class="oc-copy-field-value" type="{{ $masked ? 'password' : 'text' }}" readonly value="{{ $shown }}" aria-label="{{ $name }}" autocomplete="off">
    @endif
    @if ($masked)
        <button class="oc-copy-field-toggle" type="button" aria-pressed="false" aria-controls="{{ $valueId }}" aria-label="{{ $revealLabel }}"><x-oc::webicon name="mdi:eye" bare fallback="iconify" class="oc-copy-field-icon-show" /><x-oc::webicon name="mdi:eye-off" bare fallback="iconify" class="oc-copy-field-icon-hide" /></button>
    @endif
    <button class="oc-copy-field-button" type="button" data-copied-label="{{ $copiedLabel }}" @if ($group) data-copy="{{ $value }}" @endif>@if ($icon)<x-oc::webicon name="mdi:content-copy" bare fallback="iconify" class="oc-copy-field-icon-copy" /><x-oc::webicon name="mdi:check" bare fallback="iconify" class="oc-copy-field-icon-copied" />@endif<span class="oc-copy-field-button-label">{{ $button }}</span></button>
    <span class="oc-copy-field-status oc-visually-hidden" role="status" aria-live="polite"></span>
    @if ($caption)<p class="oc-copy-field-caption">{{ $caption }}</p>@endif
</div>
@once
    <script>
        document.addEventListener('click', async (e) => {
          const toggle = e.target.closest('.oc-copy-field-toggle');
          if (toggle) {
            const show = toggle.getAttribute('aria-pressed') !== 'true';
            toggle.setAttribute('aria-pressed', String(show));
            const input = toggle.parentElement.querySelector('input.oc-copy-field-value');
            if (input) input.type = show ? 'text' : 'password';
            return;
          }
          const btn = e.target.closest('.oc-copy-field-button');
          if (!btn) return;
          const field = btn.parentElement;
          const value = field.querySelector('.oc-copy-field-value');
          // data-copy: the raw code when the field shows it in groups ("K7QM 2XPA" -> "K7QM2XPA")
          try { await navigator.clipboard.writeText(btn.dataset.copy ?? value.value); } catch { return; }
          // data-copied-label: the feedback on the button and in the live region (.oc-copy-field-status)
          const label = btn.querySelector('.oc-copy-field-button-label');
          const status = field.querySelector('.oc-copy-field-status');
          const done = btn.dataset.copiedLabel || 'Copied';
          if (label) { label.dataset.label ??= label.textContent; label.textContent = done; }
          if (status) status.textContent = done;
          btn.classList.add('is-copied');
          clearTimeout(btn.ocCopyTimer);
          btn.ocCopyTimer = setTimeout(() => {
            btn.classList.remove('is-copied');
            if (label) label.textContent = label.dataset.label;
            if (status) status.textContent = '';
          }, 2000);
        });
    </script>
@endonce
