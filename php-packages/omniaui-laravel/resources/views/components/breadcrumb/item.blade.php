{{-- OmniaCSS compound breadcrumb (0.17.1): one level, .oc-breadcrumb-item. Props: as (li, default, inside
     <x-oc::breadcrumb.list>; span straight in <x-oc::breadcrumb>). Slot: a .link, the .page or the .ellipsis. --}}
@props(['as' => 'li'])
<{{ $as }} {{ $attributes->class(['oc-breadcrumb-item']) }}>{{ $slot }}</{{ $as }}>
