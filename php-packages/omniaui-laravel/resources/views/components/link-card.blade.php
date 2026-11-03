{{-- OmniaUI link card (a card that is a whole link). Props: title, href, icon (webicon name), accent, more. Slot = the text. --}}
@props(['title' => '', 'href' => '#', 'icon' => null, 'accent' => null, 'more' => null])
<a {{ $attributes->class(['oc-link-card', 'oc-accent--'.$accent => $accent])->merge(['href' => $href]) }}>
    @if ($icon)
        <span class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true"><iconify-icon icon="{{ $icon }}"></iconify-icon></span>
    @endif
    <span class="oc-link-card__title">{{ $title }}</span>
    @if (trim((string) $slot) !== '')
        <span class="oc-link-card__text">{{ $slot }}</span>
    @endif
    @if ($more)
        <span class="oc-link-card__more">{{ $more }}</span>
    @endif
</a>
