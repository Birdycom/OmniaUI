{{-- File: resources/views/components/sidebar/provider.blade.php | Map: props -> div.oc-sidebar-provider[data-oc-sidebar-provider] (state, persist, storage, breakpoint, shortcut)
     OmniaUI sidebar provider (0.17.0). Load packages/ui/src/sidebar.js (npx omniaui copy-js sidebar) for the behaviour.
     Props: collapsed (start collapsed; with storage="cookie" pass the cookie value so the first paint is right),
     persist (a key: remember the desktop state), storage (local|cookie: localStorage oc-sidebar:<key> or cookie
     oc-sidebar-<key>, "1" = collapsed), mobile-breakpoint (px, default 768, 0 = never), shortcut (Ctrl/Cmd + key, default
     "b", false = none). Slot: <x-oc::sidebar>, <x-oc::sidebar.rail>, <x-oc::sidebar.inset>. --}}
@props(['collapsed' => false, 'persist' => null, 'storage' => 'local', 'mobileBreakpoint' => 768, 'shortcut' => 'b'])
<div {{ $attributes->class(['oc-sidebar-provider'])->merge(array_filter([
    'data-oc-sidebar-provider' => '',
    'data-state' => $collapsed ? 'collapsed' : 'expanded',
    'data-oc-persist' => $persist === true ? 'default' : $persist,
    'data-oc-storage' => $storage === 'cookie' ? 'cookie' : null,
    'data-oc-mobile-breakpoint' => (int) $mobileBreakpoint === 768 ? null : (string) (int) $mobileBreakpoint,
    'data-oc-shortcut' => $shortcut === false ? '' : ($shortcut === 'b' ? null : $shortcut),
], fn ($value) => $value !== null)) }}>
    {{ $slot }}
</div>
