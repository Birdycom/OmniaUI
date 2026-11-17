{{-- OmniaCSS alert. Props: variant (info|success|warning|danger), title, inline (compact, under a field), icon (webicon name,
     left), alarm ('new' pulses until acknowledged, 'seen' is calm; tone danger by default). Slots: description (default),
     actions (buttons on the right). --}}
@props(['variant' => null, 'title' => null, 'inline' => false, 'icon' => null, 'alarm' => null])
@php($variant = $variant ?? ($alarm ? 'danger' : 'info'))
@php($parts = $icon || isset($actions))
<div {{ $attributes->class(['oc-alert', 'oc-alert--'.$variant => $variant, 'oc-alert--inline' => $inline, 'oc-alert--alarm' => $alarm])->merge(array_filter(['role' => $variant === 'danger' || $alarm === 'new' ? 'alert' : 'status', 'data-state' => $alarm])) }}>
    @if ($parts)
        @if ($icon)<span class="oc-alert-icon" aria-hidden="true"><x-oc::webicon :name="$icon" bare fallback="iconify" /></span>@endif
        <div class="oc-alert-body">
            @if ($title)
                <h4 class="oc-alert-title">{{ $title }}</h4>
            @endif
            <p class="oc-alert-description">{{ $slot }}</p>
        </div>
        @isset($actions)<div class="oc-alert-actions">{{ $actions }}</div>@endisset
    @else
        @if ($title)
            <h4 class="oc-alert-title">{{ $title }}</h4>
        @endif
        <p class="oc-alert-description">{{ $slot }}</p>
    @endif
</div>
