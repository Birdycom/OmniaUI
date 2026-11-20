{{-- OmniaCSS card. Props: title, description, size (sm), accent (primary|info|success|warning|destructive|test|live: a 2px border
     in that tone), inactive (with accent: a set not in use now, dashed), fill (as high as its grid cell, footer at the bottom). Slots: default = content, band (<x-oc::card-band>
     at the top), header (replaces title/description), footer. footerDivider / footerEnd: a line above the footer / the actions on the
     end side; footerClass: more classes for the footer. bare: the slot goes in as it is, without the .oc-card-content wrapper.
     0.17.0: slot action (in the header, top-right corner: .oc-card-action), text (body text in the muted color, p.oc-card-text,
     before the slot). Parts: <x-oc::card.link>, <x-oc::card.grid>. --}}
@props(['title' => null, 'description' => null, 'size' => null, 'accent' => null, 'inactive' => false, 'fill' => false,
    'footerDivider' => false, 'footerEnd' => false, 'footerClass' => null, 'bare' => false, 'text' => null])
@php($ocCardAction = isset($action) && trim((string) $action) !== '' ? $action : null)
<div {{ $attributes->class(['oc-card', 'oc-card--'.$size => $size, 'oc-card--accent' => $accent, 'oc-card--fill' => $fill])->merge(array_filter(['data-tone' => $accent, 'data-active' => $accent && $inactive ? 'false' : null])) }}>
    @isset($band)
        {{ $band }}
    @endisset
    @if (isset($header) && trim((string) $header) !== '')
        <div class="oc-card-header">{{ $header }}@if ($ocCardAction)<div class="oc-card-action">{{ $ocCardAction }}</div>@endif</div>
    @elseif ($title || $description || $ocCardAction)
        <div class="oc-card-header">
            @if ($title)
                <h3 class="oc-card-title">{{ $title }}</h3>
            @endif
            @if ($description)
                <p class="oc-card-description">{{ $description }}</p>
            @endif
            @if ($ocCardAction)
                <div class="oc-card-action">{{ $ocCardAction }}</div>
            @endif
        </div>
    @endif
    @if ($bare)
        {{ $slot }}
    @elseif (! $slot->isEmpty() || $text !== null)
        <div class="oc-card-content">@if ($text !== null)<p class="oc-card-text">{{ $text }}</p>@endif{{ $slot }}</div>
    @endif
    @if (isset($footer) && trim((string) $footer) !== '')
        <div @class(['oc-card-footer', 'oc-card-footer--divider' => $footerDivider, 'oc-card-footer--end' => $footerEnd, $footerClass => $footerClass])>{{ $footer }}</div>
    @endif
</div>
