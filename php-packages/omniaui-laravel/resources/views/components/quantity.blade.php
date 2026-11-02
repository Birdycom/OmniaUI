{{-- OmniaUI quantity: minus, number input, plus. Props: name ("quantity"), id, value (1), min (0), max, step (1),
     size (md|sm), label ("Quantity"). Other attributes go on the input (wire:model, form …).
     The buttons step with form-extras.js (npx omniaui copy-js form-extras); without it the input still works. --}}
@props(['name' => 'quantity', 'id' => null, 'value' => 1, 'min' => 0, 'max' => null, 'step' => 1, 'size' => 'md', 'label' => 'Quantity'])
<div @class(['oc-quantity', 'oc-quantity--sm' => $size === 'sm'])>
    <button class="oc-quantity__step" type="button" data-oc-step="-1" aria-label="Decrease {{ mb_strtolower($label) }}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 13H5v-2h14z"/></svg></button>
    <input {{ $attributes->class(['oc-quantity__input'])->merge(['type' => 'number', 'inputmode' => 'numeric', 'name' => $name, 'id' => $id, 'value' => $value, 'min' => $min, 'max' => $max, 'step' => $step, 'aria-label' => $label]) }}>
    <button class="oc-quantity__step" type="button" data-oc-step="1" aria-label="Increase {{ mb_strtolower($label) }}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg></button>
</div>
