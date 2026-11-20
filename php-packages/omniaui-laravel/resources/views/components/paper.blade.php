{{-- File: resources/views/components/paper.blade.php | Map: props -> class list in snippet order -> element (as) with the slot
     OmniaUI paper: an off-white surface with a fine grain (packages/ui/snippets/paper.html). Needs @birdycom/omniaui CSS.
     Props: as (div|section|article|aside|main), tone (bright|ivory|gray|kraft), sheet, smooth, lined, margin, squares (--grid), dots, mm,
            edge (torn|torn-top|torn-both|zigzag), holes, fold, stack, theme (.oc-paper-theme: off-white tokens for everything inside).
     Wrap a sheet with a cut edge in <x-oc::paper.lift> for a shadow that follows the edge. --}}
@props(['as' => 'div', 'tone' => null, 'sheet' => false, 'smooth' => false, 'lined' => false, 'margin' => false, 'squares' => false, 'dots' => false,
    'mm' => false, 'edge' => null, 'holes' => false, 'fold' => false, 'stack' => false, 'theme' => false])
@php
    $tag = in_array($as, ['div', 'section', 'article', 'aside', 'main'], true) ? $as : 'div';
@endphp
<{{ $tag }} {{ $attributes->class([
    'oc-paper-theme' => $theme,
    'oc-paper',
    'oc-paper--'.$tone => $tone,
    'oc-paper--sheet' => $sheet,
    'oc-paper--smooth' => $smooth,
    'oc-paper--lined' => $lined,
    'oc-paper--margin' => $margin,
    'oc-paper--grid' => $squares,
    'oc-paper--dots' => $dots,
    'oc-paper--mm' => $mm,
    'oc-paper--'.$edge => in_array($edge, ['torn', 'torn-top', 'torn-both', 'zigzag'], true),
    'oc-paper--holes' => $holes,
    'oc-paper--fold' => $fold,
    'oc-paper--stack' => $stack,
]) }}>{{ $slot }}</{{ $tag }}>
