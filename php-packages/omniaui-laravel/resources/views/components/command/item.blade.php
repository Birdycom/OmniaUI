{{-- OmniaUI command item (0.18.0): one row in the slot of <x-oc::command>. Props: shortcut (right-aligned hint), selected
     (aria-selected), disabled (aria-disabled), value (data-value). Attributes (wire:click, x-on:click) go to the <li>.
     Slot: what the row shows; the row is a flex line with a gap,
     so wrap mixed text in a span (<span><strong>New</strong> invoice</span>); a leading icon stays outside it. Class: .oc-command-item. --}}
@props(['shortcut' => null, 'selected' => false, 'disabled' => false, 'value' => null])
<li {{ $attributes->class(['oc-command-item'])->merge(array_filter(['role' => 'option', 'data-value' => $value, 'aria-selected' => $selected ? 'true' : null, 'aria-disabled' => $disabled ? 'true' : null], fn ($v) => $v !== null)) }}>{{ $slot }}@if ($shortcut !== null) <span class="oc-command-shortcut">{{ $shortcut }}</span>@endif</li>
