{{-- OmniaCSS definition list panel. Props: title, description, items (term => detail), label. Slots: default = extra rows, footer. --}}
@props(['title' => null, 'description' => null, 'items' => [], 'label' => null])
<div {{ $attributes->class(['oc-dl-panel'])->merge(['role' => 'region', 'aria-label' => $label ?? $title]) }}>
    @if ($title)
        <h3 class="oc-dl-title">{{ $title }}</h3>
    @endif
    @if ($description)
        <p class="oc-dl-description">{{ $description }}</p>
    @endif
    <dl class="oc-dl">
        @foreach ($items as $term => $detail)
            <div class="oc-dl-row"><dt class="oc-dl-term">{{ $term }}</dt><dd class="oc-dl-detail">{{ $detail }}</dd></div>
        @endforeach
        {{ $slot }}
    </dl>
    @if (isset($footer) && trim((string) $footer) !== '')
        <div class="oc-dl-footer">{{ $footer }}</div>
    @endif
</div>
