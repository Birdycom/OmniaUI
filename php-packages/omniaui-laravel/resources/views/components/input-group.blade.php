{{-- OmniaCSS input group. Props: prefix, suffix (addon text), prefix-icon / suffix-icon (webicon name as the addon), affix
     (.oc-input-group--affix: the addon sits inside the field, for an icon), error. Slots prefix / suffix: your own addon
     (an <svg>, a select, a button) instead of the text. Attributes go to the input.
     0.17.0: variant ("ledger": .oc-input-group--ledger on the group, .oc-input--ledger on the input), module (data-module on the group). --}}
@props(['prefix' => null, 'suffix' => null, 'prefixIcon' => null, 'suffixIcon' => null, 'affix' => false, 'error' => false, 'variant' => null, 'module' => null])
@php
    $filledAddon = fn ($v) => $v instanceof \Illuminate\View\ComponentSlot ? trim((string) $v) !== '' : filled($v);
    $ledger = $variant === 'ledger';
@endphp
<div @class(['oc-input-group', 'oc-input-group--affix' => $affix, 'oc-input-group--ledger' => $ledger]) @if ($module) data-module="{{ $module }}" @endif>
    @if ($prefixIcon)
        <span class="oc-input-addon" aria-hidden="true"><x-oc::webicon :name="$prefixIcon" bare fallback="iconify" /></span>
    @elseif ($filledAddon($prefix))
        <span class="oc-input-addon">{{ $prefix }}</span>
    @endif
    <input {{ $attributes->class(['oc-input', 'oc-input--error' => $error, 'oc-input--ledger' => $ledger])->merge(['type' => 'text']) }}>
    @if ($suffixIcon)
        <span class="oc-input-addon" aria-hidden="true"><x-oc::webicon :name="$suffixIcon" bare fallback="iconify" /></span>
    @elseif ($filledAddon($suffix))
        <span class="oc-input-addon">{{ $suffix }}</span>
    @endif
</div>
