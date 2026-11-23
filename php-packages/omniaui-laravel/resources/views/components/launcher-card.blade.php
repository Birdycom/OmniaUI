{{-- OmniaCSS launcher card. Props: href, title, description, active, disabled, disabled-footer (footer text while disabled,
     in place of the footer slot), module (0.17.0: data-module, blue|green|purple|gold|cyan|pink|red|orange|teal|slate or your own
     name). Slots: icon, badge (inside the title), footer, disabledFooter. --}}
@props(['href' => '#', 'title' => null, 'description' => null, 'active' => false, 'disabled' => false, 'disabledFooter' => null, 'module' => null])
<a {{ $attributes->class(['oc-launcher', 'is-active' => $active])->merge(array_filter(['href' => $disabled ? null : $href, 'data-module' => $module])) }} @if ($disabled) aria-disabled="true" @endif @if ($active) aria-current="true" @endif>
    @if (isset($icon))
        <span class="oc-launcher-icon" aria-hidden="true">{{ $icon }}</span>
    @endif
    <h3 class="oc-launcher-title">{{ $title }}@if (isset($badge)) {{ $badge }}@endif</h3>
    @if ($description)
        <p class="oc-launcher-description">{{ $description }}</p>
    @endif
    @if ($disabled && $disabledFooter !== null && trim((string) $disabledFooter) !== '')
        <span class="oc-launcher-footer">{{ $disabledFooter }}</span>
    @elseif (isset($footer) && trim((string) $footer) !== '')
        <span class="oc-launcher-footer">{{ $footer }}</span>
    @endif
</a>
