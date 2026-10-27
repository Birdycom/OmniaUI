{{-- File: resources/views/components/entity-card.blade.php | Map: props -> article -> grid (frame | body: eyebrow, title, description, facts) -> footer
     OmniaUI entity card. Props: title, eyebrow, description, src / alt or glyph (frame content), contain, facts (['Key' => 'Value']),
     stacked, size (sm). Slots: media (frame content), default (extra body content), footer. --}}
@props(['title', 'eyebrow' => null, 'description' => null, 'src' => null, 'alt' => '', 'glyph' => null, 'contain' => false, 'facts' => [], 'stacked' => false, 'size' => null])
<article {{ $attributes->class(['oc-entity-card', 'oc-entity-card--stacked' => $stacked, 'oc-entity-card--sm' => $size === 'sm']) }}>
    <div class="oc-entity-card__grid">
        <div @class(['oc-entity-card__frame', 'oc-entity-card__frame--contain' => $contain])>
            @if (isset($media) && trim((string) $media) !== '')
                {{ $media }}
            @elseif ($src)
                <img src="{{ $src }}" alt="{{ $alt }}">
            @elseif ($glyph)
                <span class="oc-entity-card__glyph" aria-hidden="true">{{ $glyph }}</span>
            @endif
        </div>
        <div class="oc-entity-card__body">
            @if ($eyebrow)
                <p class="oc-entity-card__eyebrow">{{ $eyebrow }}</p>
            @endif
            <h3 class="oc-entity-card__title">{{ $title }}</h3>
            @if ($description)
                <p class="oc-entity-card__description">{{ $description }}</p>
            @endif
            @if (count($facts))
                <dl class="oc-entity-card__facts">
                    @foreach ($facts as $key => $value)
                        <dt>{{ $key }}</dt><dd>{{ $value }}</dd>
                    @endforeach
                </dl>
            @endif
            {{ $slot }}
        </div>
    </div>
    @if (isset($footer) && trim((string) $footer) !== '')
        <div class="oc-entity-card__footer">{{ $footer }}</div>
    @endif
</article>
