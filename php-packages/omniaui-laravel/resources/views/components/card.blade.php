{{-- OmniaCSS card. Props: title, description, size (sm), accent (primary|info|success|warning|destructive|test|live: a 2px border
     in that tone), inactive (with accent: a set not in use now, dashed). Slots: default = content, band (<x-oc::card-band>
     at the top), header (replaces title/description), footer. --}}
@props(['title' => null, 'description' => null, 'size' => null, 'accent' => null, 'inactive' => false])
<div {{ $attributes->class(['oc-card', 'oc-card--'.$size => $size, 'oc-card--accent' => $accent])->merge(array_filter(['data-tone' => $accent, 'data-active' => $accent && $inactive ? 'false' : null])) }}>
    @isset($band)
        {{ $band }}
    @endisset
    @if (isset($header) && trim((string) $header) !== '')
        <div class="oc-card-header">{{ $header }}</div>
    @elseif ($title || $description)
        <div class="oc-card-header">
            @if ($title)
                <h3 class="oc-card-title">{{ $title }}</h3>
            @endif
            @if ($description)
                <p class="oc-card-description">{{ $description }}</p>
            @endif
        </div>
    @endif
    @if (! $slot->isEmpty())
        <div class="oc-card-content">{{ $slot }}</div>
    @endif
    @if (isset($footer) && trim((string) $footer) !== '')
        <div class="oc-card-footer">{{ $footer }}</div>
    @endif
</div>
