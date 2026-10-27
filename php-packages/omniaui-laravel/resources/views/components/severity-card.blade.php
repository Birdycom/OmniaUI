{{-- File: resources/views/components/severity-card.blade.php | Map: details -> summary head (icon, title + tags, level badge) -> body (default slot, actions slot)
     OmniaUI severity card: expandable card colored by risk. Needs @birdycom/omniaui CSS.
     Props: level (low|medium|high|critical), title, tags (list), levelLabel (badge text), resolved, name (exclusive group), open.
     Slots: icon, default (body), actions. --}}
@props(['level' => 'medium', 'title', 'tags' => [], 'levelLabel' => null, 'resolved' => false, 'name' => null, 'open' => false, 'icon' => null, 'actions' => null])
<details {{ $attributes->class(['oc-severity-card', 'oc-severity-card--'.$level, 'is-resolved' => $resolved])->merge($name ? ['name' => $name] : []) }} @if ($open) open @endif>
    <summary class="oc-severity-card-head">
        @if (isset($icon) && trim((string) $icon) !== '')
            <span class="oc-severity-card-icon" aria-hidden="true">{{ $icon }}</span>
        @endif
        <span class="oc-severity-card-main">
            <span class="oc-severity-card-title">{{ $title }}</span>
            @if (count($tags))
                <span class="oc-severity-card-tags">@foreach ($tags as $tag)<span class="oc-severity-card-tag">{{ $tag }}</span>@endforeach</span>
            @endif
        </span>
        <span class="oc-severity-card-level">{{ $levelLabel ?? ucfirst($level) }}</span>
    </summary>
    <div class="oc-severity-card-body">
        {{ $slot }}
        @if (isset($actions) && trim((string) $actions) !== '')
            <div class="oc-severity-card-actions">{{ $actions }}</div>
        @endif
    </div>
</details>
