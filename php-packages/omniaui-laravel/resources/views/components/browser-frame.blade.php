{{-- File: resources/views/components/browser-frame.blade.php | Map: props -> figure -> bar (dots, address, actions) -> view (slot or img) -> caption
     OmniaUI browser frame. Props: url (address pill), src / alt (screenshot), caption, minimal, dark, tilt, auto (free height),
     ratio ("16 / 9"). Slots: default (live content, replaces the screenshot), actions (glyphs right in the bar). --}}
@props(['url' => null, 'src' => null, 'alt' => '', 'caption' => null, 'minimal' => false, 'dark' => false, 'tilt' => false, 'auto' => false, 'ratio' => null])
<figure {{ $attributes->class([
    'oc-browser-frame',
    'oc-browser-frame--minimal' => $minimal,
    'oc-browser-frame--dark' => $dark,
    'oc-browser-frame--tilt' => $tilt,
    'oc-browser-frame--auto' => $auto,
])->merge($ratio ? ['style' => '--oc-browser-frame-ratio: '.$ratio] : []) }}>
    <div class="oc-browser-frame__bar">
        <i></i><i></i><i></i>
        @if ($url)
            <span class="oc-browser-frame__address">{{ $url }}</span>
        @endif
        @if (isset($actions) && trim((string) $actions) !== '')
            <span class="oc-browser-frame__actions" aria-hidden="true">{{ $actions }}</span>
        @endif
    </div>
    <div class="oc-browser-frame__view">
        @if (! $slot->isEmpty())
            {{ $slot }}
        @elseif ($src)
            <img src="{{ $src }}" alt="{{ $alt }}">
        @else
            <div class="oc-media-art" role="img" aria-label="{{ $alt }}"></div>
        @endif
    </div>
    @if ($caption)
        <figcaption class="oc-browser-frame__caption">{{ $caption }}</figcaption>
    @endif
</figure>
