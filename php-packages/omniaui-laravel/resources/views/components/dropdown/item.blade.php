{{-- File: resources/views/components/dropdown/item.blade.php | Map: props -> <a> (href) or <button> -> check | icon | label (+ description) | hint
     OmniaUI dropdown item (0.17.0) for <x-oc::dropdown>, the menu slot of <x-oc::media-card> and any .oc-dropdown-menu. Props:
     href (an <a>, else a <button type="button">), icon (webicon name), tone (primary|success|warning|destructive|muted: the
     icon in a tinted square), description (muted second line), hint (muted text on the right, "Ctrl B"), checked (true|false:
     a check item, role menuitemcheckbox), radio (with checked: role menuitemradio), destructive (red), disabled
     (aria-disabled, and disabled on a button). Slot: the label. Other attributes (wire:click, role, data-*) go to the item. --}}
@props(['href' => null, 'icon' => null, 'tone' => null, 'description' => null, 'hint' => null, 'checked' => null,
    'radio' => false, 'destructive' => false, 'disabled' => false])
@php
    $tag = $href !== null ? 'a' : 'button';
    $check = $checked !== null;
    $extra = array_filter([
        'href' => $href,
        'type' => $tag === 'button' ? 'button' : null,
        'role' => $check ? ($radio ? 'menuitemradio' : 'menuitemcheckbox') : null,
        'aria-checked' => $check ? ($checked ? 'true' : 'false') : null,
        'aria-disabled' => $disabled ? 'true' : null,
        'disabled' => $disabled && $tag === 'button' ? true : null,
    ], fn ($value) => $value !== null);
@endphp
<{{ $tag }} {{ $attributes->class(['oc-dropdown-item', 'oc-dropdown-item--destructive' => $destructive])->merge($extra) }}>@if ($check)<span class="oc-dropdown-check" aria-hidden="true"></span>@endif<?php if ($icon): ?><span @class(['oc-dropdown-icon', 'oc-dropdown-icon--'.$tone => $tone]) aria-hidden="true"><x-oc::webicon :name="$icon" bare fallback="iconify" /></span><?php endif; ?><?php if ($description !== null): ?><span class="oc-dropdown-text"><span>{{ $slot }}</span><span class="oc-dropdown-desc">{{ $description }}</span></span><?php else: ?>{{ $slot }}<?php endif; ?><?php if ($hint !== null): ?><span class="oc-dropdown-hint">{{ $hint }}</span><?php endif; ?></{{ $tag }}>
