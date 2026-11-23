{{-- OmniaCSS form field. Props: label, for (id of the control), description, error, name (reads the validator error for it).
     0.17.0: tooltip (text, or <x-slot:tooltip> for rich content: an info icon after the label), tooltip-label (accessible
     name of the icon, default "More information"), required (a mark after the label; put required on the control too),
     label-trailing (text or <x-slot:label-trailing>: content at the end of the label row), error-key (data-error-key, the
     error id "<key>-error", and $errors->first(key) when error is empty), hide-label (screen readers only), variant
     ("ledger"), module (data-module). Slot: the control. --}}
@props([
    'label' => null, 'for' => null, 'description' => null, 'error' => null, 'name' => null,
    'tooltip' => null, 'tooltipLabel' => 'More information', 'required' => false, 'labelTrailing' => null, 'errorKey' => null,
    'hideLabel' => false, 'variant' => null, 'module' => null,
])
@php
    $error = $error ?? (isset($errors) ? ($errorKey ? $errors->first($errorKey) : ($name ? $errors->first($name) : null)) : null);
    $filled = fn ($v) => $v instanceof \Illuminate\View\ComponentSlot ? trim((string) $v) !== '' : filled($v);
    $richTip = $tooltip instanceof \Illuminate\View\ComponentSlot;
    $hasTip = $filled($tooltip);
    $hasTrailing = $filled($labelTrailing);
    $errorId = $errorKey ? $errorKey.'-error' : ($for ? $for.'-error' : null);
    $tipId = ($for ?: ($errorKey ?: 'oc-field-'.substr(md5(uniqid('', true)), 0, 6))).'-tip';
@endphp
<div {{ $attributes->class(['oc-field', 'oc-field--ledger' => $variant === 'ledger'])->merge(array_filter(['data-module' => $module, 'data-error-key' => $errorKey], fn ($v) => $v !== null)) }}>
    @if ($hasTip || $hasTrailing)
        <div class="oc-field-label-row">
    @endif
    @if ($label)
        <label @class(['oc-field-label', 'oc-visually-hidden' => $hideLabel]) @if ($for) for="{{ $for }}" @endif>{{ $label }}@if ($required)<span class="oc-field-required" aria-hidden="true">*</span>@endif</label>
    @endif
    @if ($hasTip)
        <span class="oc-tooltip oc-field-tooltip-wrap" @unless ($richTip) data-tooltip="{{ $tooltip }}" @endunless><button type="button" class="oc-field-tooltip" aria-label="{{ $tooltipLabel }}" aria-describedby="{{ $tipId }}"><x-oc::webicon name="mdi:information-outline" bare fallback="iconify" /></button>@if ($richTip)<span class="oc-tooltip__content" role="tooltip" id="{{ $tipId }}">{{ $tooltip }}</span>@else<span class="oc-visually-hidden" id="{{ $tipId }}">{{ $tooltip }}</span>@endif</span>
    @endif
    @if ($hasTrailing)
        <span class="oc-field-label-trailing">{{ $labelTrailing }}</span>
    @endif
    @if ($hasTip || $hasTrailing)
        </div>
    @endif
    {{ $slot }}
    @if ($description)
        <p class="oc-field-description" @if ($for) id="{{ $for }}-help" @endif>{{ $description }}</p>
    @endif
    @if ($error)
        <p class="oc-field-error" role="alert" @if ($errorId) id="{{ $errorId }}" @endif>{{ $error }}</p>
    @endif
</div>
