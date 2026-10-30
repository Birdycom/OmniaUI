{{-- OmniaCSS alert. Props: variant (info|success|warning|danger), title, inline (compact, under a field). Slot: description. --}}
@props(['variant' => 'info', 'title' => null, 'inline' => false])
<div {{ $attributes->class(['oc-alert', 'oc-alert--'.$variant => $variant, 'oc-alert--inline' => $inline])->merge(['role' => $variant === 'danger' ? 'alert' : 'status']) }}>
    @if ($title)
        <h4 class="oc-alert-title">{{ $title }}</h4>
    @endif
    <p class="oc-alert-description">{{ $slot }}</p>
</div>
