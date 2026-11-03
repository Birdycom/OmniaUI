{{-- OmniaUI result (outcome of an action in place of the form). Props: title, icon (webicon name), accent, center. Slots: default (text), actions. --}}
@props(['title' => '', 'icon' => null, 'accent' => null, 'center' => false])
<div {{ $attributes->class(['oc-result', 'oc-result--center' => $center])->merge(['role' => 'status', 'tabindex' => '-1']) }}>
    @if ($icon)
        <span @class(['oc-icon-tile oc-icon-tile--sm', 'oc-accent--'.$accent => $accent]) aria-hidden="true"><iconify-icon icon="{{ $icon }}"></iconify-icon></span>
    @endif
    <h2 class="oc-result__title">{{ $title }}</h2>
    @if (trim((string) $slot) !== '')
        <p class="oc-result__text">{{ $slot }}</p>
    @endif
    @isset($actions)
        <div class="oc-result__actions">{{ $actions }}</div>
    @endisset
</div>
