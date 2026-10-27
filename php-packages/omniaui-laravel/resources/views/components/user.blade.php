{{-- OmniaCSS user (avatar + name + e-mail). Props: name, email, initials (default from name), src (avatar image), size (sm|lg|xl). --}}
@props(['name' => null, 'email' => null, 'initials' => null, 'src' => null, 'size' => null])
@php
    $initials ??= collect(preg_split('/\s+/', trim((string) $name)))->filter()->take(2)->map(fn ($w) => mb_strtoupper(mb_substr($w, 0, 1)))->implode('');
@endphp
<div {{ $attributes->class(['oc-user']) }}>
    <span @class(['oc-avatar', 'oc-avatar--'.$size => $size])>
        @if ($src)
            <img src="{{ $src }}" alt="">
        @else
            {{ $initials }}
        @endif
    </span>
    <span class="oc-user-text">
        <span class="oc-user-name">{{ $name }}</span>
        @if ($email)
            <span class="oc-user-email">{{ $email }}</span>
        @endif
    </span>
</div>
