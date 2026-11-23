{{-- File: resources/views/components/phone-input.blade.php | Map: props -> frame -> dial select -> tel input
     OmniaUI phone input. Props: name (number field), dialName, dial (selected code), countries (dial => label), value (national number), size (sm), error,
     dial-model (Livewire property for the dial code: wire:model on the select), dial-attributes (extra attributes for the select, e.g.
     ['wire:model.live' => 'dial'] or ['x-model' => 'dial']), dial-label (aria-label, default "Country code").
     Attributes go to the number input (wire:model="phone" binds the number). Join dial + number on the server. --}}
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
])
<div @class(['oc-phone-input', 'oc-phone-input--sm' => $size === 'sm', 'oc-phone-input--error' => $error])>
    <select {{ (new \Illuminate\View\ComponentAttributeBag((array) $dialAttributes))->class(['oc-phone-input-dial'])->merge(array_filter(['name' => $dialName, 'aria-label' => $dialLabel, 'wire:model' => $dialModel])) }}>
        @foreach ($countries as $code => $label)
            <option value="{{ $code }}" @selected((string) $dial === (string) $code)>{{ $label }}</option>
        @endforeach
    </select>
    <input {{ $attributes->class(['oc-phone-input-number'])->merge(['name' => $name, 'type' => 'tel', 'inputmode' => 'tel', 'autocomplete' => 'tel-national', 'value' => $value, 'aria-invalid' => $error ? 'true' : null]) }}>
</div>
