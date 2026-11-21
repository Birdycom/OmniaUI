{{-- File: resources/views/components/scrim.blade.php | Map: props -> span.oc-scrim + side / dark modifiers, tokens as style
     OmniaUI scrim (0.17.0): a calm fade over a picture so text on it stays readable. Put it inside a positioned element
     (class="relative") after the image; text on top gets class="oc-scrim-content".
     Props: side (bottom|top|start|end|full), dark (near-black scrim), strength (0 to 1), size (e.g. 60% or 12rem),
     color (own scrim color). Decorative: aria-hidden. --}}
@props(['side' => 'bottom', 'dark' => false, 'strength' => null, 'size' => null, 'color' => null])
@php
    $vars = collect([
        '--oc-scrim-strength' => $strength,
        '--oc-scrim-size' => $size,
        '--oc-scrim-color' => $color,
    ])->filter(fn ($v) => $v !== null && $v !== '')->map(fn ($v, $k) => $k.': '.$v)->implode('; ');
@endphp
<span {{ $attributes->class([
    'oc-scrim',
    'oc-scrim--'.$side => in_array($side, ['top', 'start', 'end', 'full'], true),
    'oc-scrim--dark' => (bool) $dark,
])->merge(array_filter(['aria-hidden' => 'true', 'style' => $vars ?: null])) }}></span>
