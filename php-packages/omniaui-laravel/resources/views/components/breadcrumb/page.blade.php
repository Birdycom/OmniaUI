{{-- OmniaCSS compound breadcrumb (0.18.0): the current page (aria-current="page"), not a link. Props: icon. Slot: the label. --}}
@props(['icon' => null])
<span {{ $attributes->class(['oc-breadcrumb-page'])->merge(['aria-current' => 'page']) }}>@if ($icon)<x-oc::webicon :name="$icon" bare fallback="iconify" />@endif{{ $slot }}</span>
