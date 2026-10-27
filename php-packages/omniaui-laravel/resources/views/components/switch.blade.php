{{-- OmniaCSS switch. Props: none. Attributes (name, checked, wire:model, ...) go to the checkbox; `class` goes to the label. --}}
<label @if ($attributes->has('class')) class="oc-switch {{ $attributes->get('class') }}" @else class="oc-switch" @endif>
    <input {{ $attributes->except('class')->merge(['type' => 'checkbox', 'role' => 'switch']) }}>
    <span class="oc-switch-track"></span>
</label>
