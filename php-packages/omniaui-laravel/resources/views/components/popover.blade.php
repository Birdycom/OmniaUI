{{-- OmniaCSS popover. Props: id, title, text, size (sm|lg), trigger (button label), variant (trigger button variant).
     Slots: default = panel content, trigger (replaces the button). --}}
@props(['id' => null, 'title' => null, 'text' => null, 'size' => null, 'trigger' => 'Open', 'variant' => 'outline'])
@php($id = $id ?: 'oc-popover-'.substr(md5(uniqid('', true)), 0, 6))
<button class="oc-btn oc-btn--{{ $variant }}" type="button" popovertarget="{{ $id }}">{{ $trigger }}</button>
<div {{ $attributes->class(['oc-popover', 'oc-popover--'.$size => $size])->merge(['id' => $id]) }} popover>
    @if ($title)
        <h3 class="oc-popover-title">{{ $title }}</h3>
    @endif
    @if ($text)
        <p class="oc-popover-text">{{ $text }}</p>
    @endif
    {{ $slot }}
</div>
