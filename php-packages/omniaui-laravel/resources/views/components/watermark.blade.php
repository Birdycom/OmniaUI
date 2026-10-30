{{-- File: resources/views/components/watermark.blade.php | Map: props -> span.oc-watermark + modifiers (text once or tiled)
     OmniaUI watermark: light text over its positioned parent (put it last inside an element with class="relative").
     Props: text (Concept), variant (diagonal|straight|tile|corner|corner-top), tone (default|light|primary|destructive),
     repeat (12, for tile), mono (gray <img> logo). Slots: default = the text (instead of the text prop); mark = a logo
     (<img>) or icon (<svg>) instead of text. Click-through and aria-hidden. --}}
@props(['text' => 'Concept', 'variant' => 'diagonal', 'tone' => 'default', 'repeat' => 12, 'mono' => false, 'mark' => null])
@php
    $label = $slot->isEmpty() ? e($text) : (string) $slot;
    $count = $variant === 'tile' ? max(1, (int) $repeat) : 1;
    // One piece per repeat: the logo/icon slot as it is, or the text in a span (escaped above when it is the prop).
    $piece = $mark ? (string) $mark : '<span>'.$label.'</span>';
@endphp
<span {{ $attributes->class([
    'oc-watermark',
    'oc-watermark--'.$variant => in_array($variant, ['straight', 'tile', 'corner', 'corner-top'], true),
    'oc-watermark--'.$tone => in_array($tone, ['light', 'primary', 'destructive'], true),
    'oc-watermark--mono' => (bool) $mono,
])->merge(['aria-hidden' => 'true']) }}>{!! str_repeat($piece, $count) !!}</span>
