{{-- File: resources/views/components/greeting.blade.php | Map: time of day from now() -> header -> icon slot -> body (eyebrow, title + name, date) -> actions slot
     OmniaUI greeting: dashboard header. Needs @birdycom/omniaui CSS.
     Props: name, time (morning|afternoon|evening; default from now(): 05-12, 12-18, otherwise evening),
            words (['morning' => 'Goedemorgen', ...]), date (Carbon/DateTime; default now()), format (isoFormat pattern),
            eyebrow, lg, hideDate.
     Slots: icon, actions. --}}
@props([
    'name' => null,
    'time' => null,
    'words' => [],
    'date' => null,
    'format' => 'dddd D MMMM YYYY',
    'eyebrow' => null,
    'lg' => false,
    'hideDate' => false,
    'icon' => null,
    'actions' => null,
])
@php
    $when = $date ? \Illuminate\Support\Carbon::parse($date) : now();
    $hour = (int) $when->format('G');
    $time = $time ?? ($hour >= 5 && $hour < 12 ? 'morning' : ($hour >= 12 && $hour < 18 ? 'afternoon' : 'evening'));
    $word = $words[$time] ?? ['morning' => 'Good morning', 'afternoon' => 'Good afternoon', 'evening' => 'Good evening'][$time];
@endphp
<header {{ $attributes->class(['oc-greeting', 'oc-greeting--'.$time, 'oc-greeting--lg' => $lg]) }}>
    @if (isset($icon) && trim((string) $icon) !== '')
        <span class="oc-greeting-icon" aria-hidden="true">{{ $icon }}</span>
    @endif
    <div class="oc-greeting-body">
        @if ($eyebrow)
            <p class="oc-greeting-eyebrow">{{ $eyebrow }}</p>
        @endif
        <h2 class="oc-greeting-title">{{ $word }}@if ($name), <span class="oc-greeting-name">{{ $name }}</span>@endif</h2>
        @unless ($hideDate)
            <time class="oc-greeting-date" datetime="{{ $when->format('Y-m-d') }}">{{ $when->isoFormat($format) }}</time>
        @endunless
    </div>
    @if (isset($actions) && trim((string) $actions) !== '')
        <div class="oc-greeting-actions">{{ $actions }}</div>
    @endif
</header>
