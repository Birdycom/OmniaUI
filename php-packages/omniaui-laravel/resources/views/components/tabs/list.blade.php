{{-- OmniaCSS tab list of the compound tabs (0.17.0): .oc-tab-list[role=tablist][data-oc-tabs] (oc-tabs.js: clicks, arrow keys).
     Props (also taken from <x-oc::tabs>): variant (pill|vertical), label (aria-label), counts (.oc-data-table-tabs).
     Slot: <x-oc::tabs.trigger> buttons. --}}
@aware(['variant' => null, 'label' => null])
@props(['counts' => false, 'variant' => null, 'label' => null])
<div {{ $attributes->class(['oc-tab-list', 'oc-tab-list--'.$variant => $variant, 'oc-data-table-tabs' => $counts])->merge(['role' => 'tablist', 'aria-label' => $label, 'aria-orientation' => $variant === 'vertical' ? 'vertical' : null]) }} data-oc-tabs>{{ $slot }}</div>
