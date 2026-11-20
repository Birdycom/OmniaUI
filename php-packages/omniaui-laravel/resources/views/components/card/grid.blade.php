{{-- OmniaUI card grid (0.17.0): a responsive grid of cards (.oc-card-grid: auto-fill columns of at least `min`). Props: min
     (--oc-card-min, default 17rem), gap (--oc-card-gap, default 1.25rem), bands (the cards share their rows, so bands, content
     and footers line up: .oc-card-grid--bands), wide (cards from 32rem), fit (fewer cards stretch over the full width).
     Slot: the cards. --}}
@props(['min' => null, 'gap' => null, 'bands' => false, 'wide' => false, 'fit' => false])
@php($ocCardGridStyle = trim(($min !== null ? '--oc-card-min: '.(is_numeric($min) ? $min.'rem' : $min).'; ' : '').($gap !== null ? '--oc-card-gap: '.(is_numeric($gap) ? $gap.'rem' : $gap) : ''), '; '))
<div {{ $attributes->class(['oc-card-grid', 'oc-card-grid--bands' => $bands, 'oc-card-grid--wide' => $wide, 'oc-card-grid--fit' => $fit])->merge($ocCardGridStyle !== '' ? ['style' => $ocCardGridStyle] : []) }}>{{ $slot }}</div>
