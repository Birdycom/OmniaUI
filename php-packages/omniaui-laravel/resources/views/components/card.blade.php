{{-- OmniaCSS card. Props: title, description, size (sm). Slots: default = content, header (replaces title/description), footer. --}}
@props(['title' => null, 'description' => null, 'size' => null])
<div {{ $attributes->class(['oc-card', 'oc-card--'.$size => $size]) }}>
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
