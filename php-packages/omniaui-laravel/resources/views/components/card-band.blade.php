{{-- File: resources/views/components/card-band.blade.php | Map: props -> div.oc-card-band (start slot, title + description, default slot)
     The colored band at the top of an accent card (<x-oc::card accent="test">). Props: title, description.
     Slots: start (a badge before the title), default (a status after it). --}}
@props(['title' => null, 'description' => null])
<div {{ $attributes->class(['oc-card-band']) }}>
    @isset($start)
        {{ $start }}
    @endisset
    @if ($title || $description)
        <p class="oc-card-band__title">{{ $title }}@if ($description)<small>{{ $description }}</small>@endif</p>
    @endif
    {{ $slot }}
</div>
