{{-- OmniaCSS accordion item. Props: title, name (exclusive group), open. Slot: content.
     Script-controlled (0.17.0): expanded (true|false) renders div.oc-accordion-item (.is-open when true) with a <button> trigger,
     for state in your own code (a Livewire property); disabled dims that trigger; trigger-attributes are extra attributes on
     it (['wire:click' => 'toggle(0)']). --}}
@props(['title', 'name' => 'oc-accordion', 'open' => false, 'expanded' => null, 'disabled' => false, 'triggerAttributes' => []])
@if ($expanded !== null)
<div {{ $attributes->class(['oc-accordion-item', 'is-open' => $expanded]) }}>
    <button {{ (new \Illuminate\View\ComponentAttributeBag((array) $triggerAttributes))->class(['oc-accordion-trigger'])->merge(array_filter(['type' => 'button', 'aria-expanded' => $disabled ? null : ($expanded ? 'true' : 'false'), 'disabled' => $disabled ? true : null], fn ($value) => $value !== null)) }}>{{ $title }}</button>
    <div class="oc-accordion-content">{{ $slot }}</div>
</div>
@else
<details {{ $attributes->class(['oc-accordion-item'])->merge(['name' => $name]) }} @if ($open) open @endif>
    <summary class="oc-accordion-trigger">{{ $title }}</summary>
    <div class="oc-accordion-content">{{ $slot }}</div>
</details>
@endif
