{{-- OmniaCSS checkbox / radio. Props: radio (renders a radio), label. Slot: label text. Attributes (name, value, checked, wire:model) go to the input. --}}
@props(['radio' => false, 'label' => null])
<label @if ($attributes->has('class')) class="{{ $attributes->get('class') }}" @endif>
    <input {{ $attributes->except('class')->merge(['class' => $radio ? 'oc-radio' : 'oc-checkbox', 'type' => $radio ? 'radio' : 'checkbox']) }}>
    {{ $label }}{{ $slot }}
</label>
