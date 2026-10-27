{{-- OmniaCSS aspect ratio box. Props: ratio (square|photo|portrait|wide or a CSS ratio such as "5 / 2"; default 16 / 9), center (center the content). Slot: content (img, video, iframe). --}}
@props(['ratio' => null, 'center' => false])
@php
    $preset = in_array($ratio, ['square', 'photo', 'portrait', 'wide'], true) ? $ratio : null;
    $custom = $ratio && ! $preset ? '--oc-aspect: '.$ratio : null;
@endphp
<div {{ $attributes->class(['oc-aspect', 'oc-aspect--'.$preset => $preset, 'oc-aspect--center' => $center])->merge($custom ? ['style' => $custom] : []) }}>{{ $slot }}</div>
