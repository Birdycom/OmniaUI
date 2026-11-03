{{-- OmniaUI brand mark (logo from an icon and text). Props: name, accent (part in the brand gradient), tagline, href, size (sm|md|lg). Slot icon: <svg class="oc-brand-mark__icon"> or <img>. --}}
@props(['name' => '', 'accent' => null, 'tagline' => null, 'href' => '/', 'size' => 'md'])
<a {{ $attributes->class(['oc-brand-mark', 'oc-brand-mark--'.$size => $size !== 'md'])->merge(['href' => $href]) }}>
    {{ $icon ?? '' }}
    <span class="oc-brand-mark__text">
        <span class="oc-brand-mark__word">{{ $name }}@if ($accent)<span class="oc-brand-mark__accent">{{ $accent }}</span>@endif</span>
        @if ($tagline)
            <span class="oc-brand-mark__tagline">{{ $tagline }}</span>
        @endif
    </span>
</a>
