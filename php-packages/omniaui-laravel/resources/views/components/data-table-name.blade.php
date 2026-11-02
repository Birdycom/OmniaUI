{{-- File: resources/views/components/data-table-name.blade.php | Map: props -> avatar + name line + second line
     Name cell of <x-oc::data-table>: avatar (initials or image), name with a badge (slot "badge") and a muted second line.
     Props: name, initials (default: first letters of the name), avatar (image URL), sub. --}}
@props(['name', 'initials' => null, 'avatar' => null, 'sub' => null, 'badge' => null])
@php
    $letters = $initials ?? collect(preg_split('/[\s&-]+/', $name, -1, PREG_SPLIT_NO_EMPTY))->take(2)->map(fn ($w) => mb_substr($w, 0, 1))->join('');
@endphp
<span {{ $attributes->class(['oc-data-table-name']) }}>
    <span class="oc-avatar" aria-hidden="true">@if ($avatar)<img src="{{ $avatar }}" alt="">@else{{ mb_strtoupper($letters) }}@endif</span>
    <span class="oc-data-table-name-text">
        <span class="oc-data-table-name-line">{{ $name }} {{ $badge }}</span>
        @if ($sub)
            <span class="oc-data-table-name-sub">{{ $sub }}</span>
        @endif
    </span>
</span>
