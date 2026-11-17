{{-- OmniaCSS collapsible (details/summary section). Props: title, open, dense, plain (no card, for lists inside a panel), hint (a
     tip opened on purpose: dashed warning frame and a lightbulb), meta (pill before the chevron, "−5 points"). Slots: default =
     content, icon (inline svg with class oc-collapsible-icon). --}}
@props(['title', 'open' => false, 'dense' => false, 'plain' => false, 'hint' => false, 'meta' => null])
<details {{ $attributes->class(['oc-collapsible', 'oc-collapsible--dense' => $dense, 'oc-collapsible--plain' => $plain, 'oc-collapsible--hint' => $hint]) }} @if ($open) open @endif>
    <summary>
        @if (isset($icon)){{ $icon }}@elseif ($hint)<span class="oc-collapsible-icon" aria-hidden="true"><x-oc::webicon name="mdi:lightbulb-on-outline" bare fallback="iconify" /></span>@endif
        <span class="oc-collapsible-title">{{ $title }}</span>
        @if ($meta)<span class="oc-collapsible-meta">{{ $meta }}</span>@endif
    </summary>
    <div class="oc-collapsible-content">{{ $slot }}</div>
</details>
