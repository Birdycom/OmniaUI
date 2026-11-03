{{-- OmniaUI particle field (background canvas). Props: count, speed, link, local (fill the positioned parent).
     Needs oc-particles.js (npx omniaui copy-js particles). --}}
@props(['count' => null, 'speed' => null, 'link' => null, 'local' => false])
<canvas {{ $attributes->class(['oc-particles', 'oc-particles--local' => $local])->merge(array_filter(['data-count' => $count, 'data-speed' => $speed, 'data-link' => $link], fn ($v) => $v !== null)) }} aria-hidden="true"></canvas>
