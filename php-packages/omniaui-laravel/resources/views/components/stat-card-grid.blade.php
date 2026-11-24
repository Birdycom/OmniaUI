{{-- File: resources/views/components/stat-card-grid.blade.php | Map: slot with <x-oc::stat-card>
     OmniaUI stat card grid: responsive grid for a row of stat cards (equal height). Needs @birdycom/omniaui CSS.
     Props: none (extra attributes go on the div). Slot: <x-oc::stat-card> entries. --}}
<div {{ $attributes->class(['oc-stat-card-grid']) }}>{{ $slot }}</div>
