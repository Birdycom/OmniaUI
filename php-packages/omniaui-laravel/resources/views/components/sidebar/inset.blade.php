{{-- File: resources/views/components/sidebar/inset.blade.php | Map: main.oc-sidebar-inset
     OmniaUI sidebar inset (0.17.0): the page next to the sidebar; it takes the remaining width (min-inline-size 0).
     Prop: as (default main). --}}
@props(['as' => 'main'])
<{{ $as }} {{ $attributes->class(['oc-sidebar-inset']) }}>{{ $slot }}</{{ $as }}>
