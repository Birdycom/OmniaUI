{{-- OmniaCSS launcher card. Props: href, title, description, active, disabled. Slots: icon, badge (inside the title), footer. --}}
@props(['href' => '#', 'title' => null, 'description' => null, 'active' => false, 'disabled' => false])
<a {{ $attributes->class(['oc-launcher', 'is-active' => $active])->merge(['href' => $disabled ? null : $href]) }} @if ($disabled) aria-disabled="true" @endif @if ($active) aria-current="true" @endif>
    @if (isset($icon))
        <span class="oc-launcher-icon" aria-hidden="true">{{ $icon }}</span>
    @endif
    <h3 class="oc-launcher-title">{{ $title }}@if (isset($badge)) {{ $badge }}@endif</h3>
    @if ($description)
        <p class="oc-launcher-description">{{ $description }}</p>
    @endif
    @if (isset($footer) && trim((string) $footer) !== '')
        <span class="oc-launcher-footer">{{ $footer }}</span>
    @endif
</a>
