{{-- File: resources/views/components/upgrade-banner.blade.php | Map: aside -> icon slot -> body (title + plan pill, text slot, usage meter) -> actions slot -> dismiss button
     OmniaUI upgrade banner: free-plan limits callout. Needs @birdycom/omniaui CSS.
     Props: title, plan (pill), used + max + usage (label) for the meter, premium, compact, dismissible, label (aria-label).
     Slots: icon, default (text), actions. --}}
@props(['title', 'plan' => null, 'used' => null, 'max' => null, 'usage' => null, 'premium' => false, 'compact' => false, 'dismissible' => false, 'label' => 'Plan limits', 'icon' => null, 'actions' => null])
<aside {{ $attributes->class(['oc-upgrade-banner', 'oc-upgrade-banner--premium' => $premium, 'oc-upgrade-banner--compact' => $compact])->merge(['aria-label' => $label]) }}>
    @if (isset($icon) && trim((string) $icon) !== '')
        <span class="oc-upgrade-banner-icon" aria-hidden="true">{{ $icon }}</span>
    @endif
    <div class="oc-upgrade-banner-body">
        <p class="oc-upgrade-banner-title">{{ $title }}@if ($plan) <span class="oc-upgrade-banner-plan">{{ $plan }}</span>@endif</p>
        @if (! $slot->isEmpty())
            <p class="oc-upgrade-banner-text">{{ $slot }}</p>
        @endif
        @if ($used !== null && $max)
            {{-- low / high make the meter turn "less good" near the limit. --}}
            <div class="oc-upgrade-banner-usage">
                <span>{{ $usage }}</span>
                <meter class="oc-upgrade-banner-meter" min="0" max="{{ $max }}" low="{{ $max * 0.6 }}" high="{{ $max * 0.8 }}" optimum="0" value="{{ $used }}" aria-label="{{ $usage }}">{{ $used }} of {{ $max }}</meter>
                <span>{{ $used }} / {{ $max }}</span>
            </div>
        @endif
    </div>
    @if (isset($actions) && trim((string) $actions) !== '')
        <div class="oc-upgrade-banner-actions">{{ $actions }}</div>
    @endif
    @if ($dismissible)
        <button class="oc-upgrade-banner-dismiss" type="button" aria-label="Dismiss">&times;</button>
    @endif
</aside>
