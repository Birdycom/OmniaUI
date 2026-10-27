{{-- OmniaCSS input group. Props: prefix, suffix (addon text), error. Attributes go to the input. --}}
@props(['prefix' => null, 'suffix' => null, 'error' => false])
<div class="oc-input-group">
    @if ($prefix)
        <span class="oc-input-addon">{{ $prefix }}</span>
    @endif
    <input {{ $attributes->class(['oc-input', 'oc-input--error' => $error])->merge(['type' => 'text']) }}>
    @if ($suffix)
        <span class="oc-input-addon">{{ $suffix }}</span>
    @endif
</div>
