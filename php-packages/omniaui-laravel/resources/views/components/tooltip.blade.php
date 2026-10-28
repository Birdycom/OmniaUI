{{-- OmniaCSS tooltip (CSS only). Props: text, multiline (keeps the line breaks of text), heading (title above text,
     rendered as .oc-tooltip__content), side (top|bottom|left|right, preferred side; with anchor positioning it flips
     when there is no room). Slot: the element that gets the tooltip. --}}
@props(['text', 'multiline' => false, 'heading' => null, 'side' => 'top'])
<span {{ $attributes->class(['oc-tooltip', 'oc-tooltip--multiline' => $multiline && ! $heading, 'oc-tooltip--'.$side => $side !== 'top'])->merge($heading ? [] : ['data-tooltip' => $text]) }}>{{ $slot }}@if ($heading)<span class="oc-tooltip__content" role="tooltip"><span class="oc-tooltip__title">{{ $heading }}</span>{{ $text }}</span>@endif</span>
