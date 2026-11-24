{{-- OmniaUI command group (0.18.0): a heading (label) and its <x-oc::command.item>s in the slot of <x-oc::command>.
     Props: label, separator (a line above the group). Classes: .oc-command-separator, .oc-command-group-label. --}}
@props(['label' => null, 'separator' => false])
@if ($separator)
<li class="oc-command-separator" role="separator"></li>
@endif
@if ($label !== null)
<li {{ $attributes->class(['oc-command-group-label'])->merge(['role' => 'presentation']) }}>{{ $label }}</li>
@endif
{{ $slot }}
