{{-- File: resources/views/components/phone-input.blade.php | Map: props -> frame -> dial select -> tel input
     OmniaUI phone input. Props: name (number field), dialName, dial (selected code), countries (dial => label), value (national number), size (sm), error,
     dial-model (Livewire property for the dial code: wire:model on the select), dial-attributes (extra attributes for the select, e.g.
     ['wire:model.live' => 'dial'] or ['x-model' => 'dial']), dial-label (aria-label, default "Country code").
     Attributes go to the number input (wire:model="phone" binds the number). Join dial + number on the server.
     0.18.0: formats (dial => grouping, one # per digit, or a list of group sizes): the value is shown in the grouping of the
     selected dial (defaults: BE ### ## ## ##, NL/FR # ## ## ## ##, DE ### #### ####; others: 3, then pairs). --}}
@props([
    'name' => 'phone',
    'dialName' => 'phone_dial',
    'dialModel' => null,
    'dialAttributes' => [],
    'dialLabel' => 'Country code',
    'dial' => '+32',
    'countries' => ['+32' => 'BE +32', '+31' => 'NL +31', '+33' => 'FR +33', '+49' => 'DE +49'],
    'value' => null,
    'size' => null,
    'error' => false,
    'formats' => [],
])
@php
    // National grouping of the selected dial: "### ## ## ##" or [3, 2, 2, 2]; digits beyond it follow in pairs.
    $ocPhoneFormats = array_replace(['+32' => '### ## ## ##', '+31' => '# ## ## ## ##', '+33' => '# ## ## ## ##', '+49' => '### #### ####'], (array) $formats);
    if (is_string($value) || is_int($value)) {
        $ocDigits = preg_replace('/\D/', '', (string) $value);
        $ocFormat = $ocPhoneFormats[(string) $dial] ?? null;
        $ocSizes = is_array($ocFormat) ? array_values(array_filter(array_map('intval', $ocFormat))) : (is_string($ocFormat) && preg_match_all('/#+/', $ocFormat, $ocRuns) ? array_map('strlen', $ocRuns[0]) : [3]);
        $ocParts = [];
        $ocAt = 0;
        foreach ($ocSizes as $ocSize) {
            if ($ocAt >= strlen($ocDigits)) {
                break;
            }
            $ocParts[] = substr($ocDigits, $ocAt, $ocSize);
            $ocAt += $ocSize;
        }
        $ocRest = substr($ocDigits, $ocAt);
        if ($ocRest !== '') {
            array_push($ocParts, ...str_split($ocRest, 2));
        }
        $value = implode(' ', array_filter($ocParts, fn ($p) => $p !== ''));
    }
@endphp
<div @class(['oc-phone-input', 'oc-phone-input--sm' => $size === 'sm', 'oc-phone-input--error' => $error])>
    <select {{ (new \Illuminate\View\ComponentAttributeBag((array) $dialAttributes))->class(['oc-phone-input-dial'])->merge(array_filter(['name' => $dialName, 'aria-label' => $dialLabel, 'wire:model' => $dialModel])) }}>
        @foreach ($countries as $code => $label)
            <option value="{{ $code }}" @selected((string) $dial === (string) $code)>{{ $label }}</option>
        @endforeach
    </select>
    <input {{ $attributes->class(['oc-phone-input-number'])->merge(['name' => $name, 'type' => 'tel', 'inputmode' => 'tel', 'autocomplete' => 'tel-national', 'value' => $value, 'aria-invalid' => $error ? 'true' : null]) }}>
</div>
