{{-- OmniaCSS tab panel. Props: active (class-toggle tabs: .is-active on the shown panel; with an id it also gets role="tabpanel").
     Slot: panel content. --}}
@props(['active' => false])
<div {{ $attributes->class(['oc-tab-panel', 'is-active' => $active])->merge($attributes->has('id') ? ['role' => 'tabpanel'] : []) }}>{{ $slot }}</div>
