{{-- OmniaCSS tooltip (CSS only). Props: text, multiline (keeps the line breaks of text), heading (title above text,
     rendered as .oc-tooltip__content), side (top|bottom|left|right, preferred side; with anchor positioning it flips
     when there is no room). Slot: the element that gets the tooltip.
     0.17.0: <x-slot:content> renders rich content (.oc-tooltip__content[role=tooltip], linked with aria-describedby);
     open (true: always shown, .is-open; false: never shown, .is-closed), delay (ms before it shows, --oc-tooltip-delay),
     content-id (id of the rich content; generated when omitted). --}}
@props(['text' => null, 'multiline' => false, 'heading' => null, 'side' => 'top', 'open' => null, 'delay' => null, 'contentId' => null])
@php
    $rich = isset($content) && trim((string) $content) !== '';
    $contentId = $contentId ?: 'oc-tooltip-'.substr(md5(uniqid('', true)), 0, 6);
    $extra = [];
    if (! $heading && ! $rich) $extra['data-tooltip'] = $text;
    if ($rich) $extra['aria-describedby'] = $contentId;
    if ($delay !== null) $extra['style'] = '--oc-tooltip-delay: '.(int) $delay.'ms';
@endphp
<span {{ $attributes->class(['oc-tooltip', 'oc-tooltip--multiline' => $multiline && ! $heading, 'oc-tooltip--'.$side => $side !== 'top', 'is-open' => $open === true, 'is-closed' => $open === false])->merge($extra) }}>{{ $slot }}@if ($heading || $rich)<span class="oc-tooltip__content" role="tooltip"@if ($rich) id="{{ $contentId }}"@endif>@if ($heading)<span class="oc-tooltip__title">{{ $heading }}</span>@endif{{ $rich ? $content : $text }}</span>@endif</span>
