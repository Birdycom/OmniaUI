{{-- OmniaUI card link (0.17.0): a small link in the primary color for a card footer ("Manage members"). Class: .oc-card-link.
     Attributes (href, wire:navigate) go to the <a>. Slot: the text. --}}
<a {{ $attributes->class(['oc-card-link']) }}>{{ $slot }}</a>
