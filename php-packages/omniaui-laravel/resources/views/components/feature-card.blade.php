{{-- OmniaUI feature card. Props: title, icon (webicon name), accent, level (2-4, default 3). Slot = the text. --}}
@props(['title' => '', 'icon' => null, 'accent' => null, 'level' => 3])
<article {{ $attributes->class(['oc-feature-card']) }}>
    @if ($icon)
        <span @class(['oc-icon-tile oc-icon-tile--sm', 'oc-accent--'.$accent => $accent]) aria-hidden="true"><iconify-icon icon="{{ $icon }}"></iconify-icon></span>
    @endif
    <h{{ $level }} class="oc-feature-card__title">{{ $title }}</h{{ $level }}>
    @if (trim((string) $slot) !== '')
        <p class="oc-feature-card__text">{{ $slot }}</p>
    @endif
</article>
