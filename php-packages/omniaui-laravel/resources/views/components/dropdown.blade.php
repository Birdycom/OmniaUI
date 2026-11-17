{{-- OmniaCSS dropdown menu (popover). Props: label (trigger text), variant (trigger button variant), id,
     items (list of ['label', 'href', 'icon' => 'mdi:pencil', 'tone' => 'primary|success|warning|destructive|muted' (icon in a
     tinted square), 'description' => 'Muted second line'] | ['group' => ...] | ['separator' => true]). Icons are inline SVG
     (<x-oc::webicon>, <iconify-icon> when the icon is not on disk). Slots: default = extra items, trigger (replaces the button). --}}
@props(['label' => 'Options', 'variant' => 'outline', 'id' => null, 'items' => []])
@php($id = $id ?: 'oc-menu-'.substr(md5(uniqid('', true)), 0, 6))
@if (isset($trigger) && trim((string) $trigger) !== '')
    {{ $trigger }}
@else
    <button class="oc-btn oc-btn--{{ $variant }}" type="button" popovertarget="{{ $id }}">{{ $label }}</button>
@endif
<div {{ $attributes->class(['oc-dropdown-menu'])->merge(['id' => $id]) }} popover>
    @foreach ($items as $item)
        @if (! empty($item['group']))
            <div class="oc-dropdown-label">{{ $item['group'] }}</div>
        @elseif (! empty($item['separator']))
            <div class="oc-dropdown-separator"></div>
        @else
            <a class="oc-dropdown-item" href="{{ $item['href'] ?? '#' }}">@if (! empty($item['icon']))<span @class(['oc-dropdown-icon', 'oc-dropdown-icon--'.($item['tone'] ?? '') => ! empty($item['tone'])]) aria-hidden="true"><x-oc::webicon :name="$item['icon']" bare fallback="iconify" /></span>@endif<?php if (! empty($item['description'])): ?><span class="oc-dropdown-text"><span>{{ $item['label'] ?? '' }}</span><span class="oc-dropdown-desc">{{ $item['description'] }}</span></span><?php else: ?>{{ $item['label'] ?? '' }}<?php endif; ?></a>
        @endif
    @endforeach
    {{ $slot }}
</div>
