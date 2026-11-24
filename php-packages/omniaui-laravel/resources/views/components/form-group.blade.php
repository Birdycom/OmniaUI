{{-- File: resources/views/components/form-group.blade.php | Map: slot (label, control, helper)
     OmniaUI legacy form group: a block with a margin below. Prefer <x-oc::form-field> / .oc-field for new forms.
     Props: none (extra attributes go on the div). Slot: .oc-label, the control and an optional .oc-helper. --}}
<div {{ $attributes->class(['oc-form-group']) }}>{{ $slot }}</div>
