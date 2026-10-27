{{-- File: resources/views/components/stat-card.blade.php | Map: card (div / a) -> icon slot -> body (value + trend, label)
     OmniaUI stat card: compact KPI tile. Put several in <div class="oc-stat-card-grid">. Needs @birdycom/omniaui CSS.
     Props: value, label, trend (chip text, e.g. "+12%"), down (trend goes down), tone (accent|success|warning), stripe, href (makes it a link).
     Slot: icon. --}}
@props(['value' => null, 'label' => null, 'trend' => null, 'down' => false, 'tone' => null, 'stripe' => false, 'href' => null, 'icon' => null])
@php($tag = $href ? 'a' : 'div')
<{{ $tag }} {{ $attributes->class([
    'oc-stat-card',
    'oc-stat-card--'.$tone => in_array($tone, ['accent', 'success', 'warning'], true),
    'oc-stat-card--stripe' => $stripe,
])->merge($href ? ['href' => $href] : []) }}>
    @if (isset($icon) && trim((string) $icon) !== '')
        <span class="oc-stat-card-icon" aria-hidden="true">{{ $icon }}</span>
    @endif
    <span class="oc-stat-card-body">
        <span class="oc-stat-card-value">{{ $value }}@if ($trend)<span class="oc-stat-card-trend oc-stat-card-trend--{{ $down ? 'down' : 'up' }}">{{ $trend }}</span>@endif</span>
        <span class="oc-stat-card-label">{{ $label }}</span>
    </span>
</{{ $tag }}>
