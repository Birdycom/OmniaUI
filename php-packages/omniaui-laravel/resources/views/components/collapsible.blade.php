{{-- OmniaCSS collapsible (details/summary section). Props: title, open, dense, plain (no card, for lists inside a panel). Slots: default = content, icon (inline svg with class oc-collapsible-icon). --}}
@props(['title', 'open' => false, 'dense' => false, 'plain' => false])
<details {{ $attributes->class(['oc-collapsible', 'oc-collapsible--dense' => $dense, 'oc-collapsible--plain' => $plain]) }} @if ($open) open @endif>
    <summary>
        @if (isset($icon)){{ $icon }}@endif
        <span class="oc-collapsible-title">{{ $title }}</span>
    </summary>
    <div class="oc-collapsible-content">{{ $slot }}</div>
</details>
