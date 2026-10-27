{{-- File: resources/views/components/page-header.blade.php | Map: header -> back slot -> main (text: title, subtitle, meta slot | actions slot)
     OmniaUI page header: title row of an app page (size container). Needs @birdycom/omniaui CSS.
     Props: title, subtitle, level (heading level 1-3, default 1), bordered, sticky, sm.
     Slots: back (e.g. <x-oc::back-link>), meta, actions; default slot = extra content after the title (e.g. a badge). --}}
@props(['title' => null, 'subtitle' => null, 'level' => 1, 'bordered' => false, 'sticky' => false, 'sm' => false, 'back' => null, 'meta' => null, 'actions' => null])
@php($h = 'h'.max(1, min(3, (int) $level)))
<header {{ $attributes->class(['oc-page-header', 'oc-page-header--bordered' => $bordered, 'oc-page-header--sticky' => $sticky, 'oc-page-header--sm' => $sm]) }}>
    @if (isset($back) && trim((string) $back) !== '')
        <div class="oc-page-header-back">{{ $back }}</div>
    @endif
    <div class="oc-page-header-main">
        <div class="oc-page-header-text">
            <{{ $h }} class="oc-page-header-title">{{ $title }}@if (! $slot->isEmpty()) {{ $slot }}@endif</{{ $h }}>
            @if ($subtitle)
                <p class="oc-page-header-subtitle">{{ $subtitle }}</p>
            @endif
            @if (isset($meta) && trim((string) $meta) !== '')
                <div class="oc-page-header-meta">{{ $meta }}</div>
            @endif
        </div>
        @if (isset($actions) && trim((string) $actions) !== '')
            <div class="oc-page-header-actions">{{ $actions }}</div>
        @endif
    </div>
</header>
