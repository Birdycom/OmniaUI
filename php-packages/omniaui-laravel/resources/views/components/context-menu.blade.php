{{-- File: resources/views/components/context-menu.blade.php | Map: props -> area (.oc-context-area, slot) -> menu (.oc-context-menu, items or slot menu) -> pointer script (once)
     OmniaUI context menu (0.17.0): a dropdown menu at the pointer for a right-click area (same markup as
     packages/ui/snippets/context-menu.html). Props: items (as in menubar/entries.blade.php), menu-label (aria-label of the
     menu, default "Actions"), id (of the menu). Slots: default = area content, menu (replaces the items). Attributes go
     to the area. The small script below (once per page) places and opens the menu. --}}
@props(['items' => [], 'menuLabel' => 'Actions', 'id' => null])
@php($id = $id ?: 'oc-ctx-'.substr(md5(uniqid('', true)), 0, 6))
<div {{ $attributes->class(['oc-context-area'])->merge(['tabindex' => '0', 'data-oc-context-menu' => $id]) }}>{{ $slot }}</div>
<div class="oc-dropdown-menu oc-context-menu" id="{{ $id }}" popover role="menu" aria-label="{{ $menuLabel }}">
    @if (isset($menu) && trim((string) $menu) !== '')
        {{ $menu }}
    @else
        <x-oc::menubar.entries :items="$items" />
    @endif
</div>
@once
    <script>
        // Context menu: on right-click (or the menu key) in a [data-oc-context-menu] area, open its menu at the pointer.
        document.addEventListener("contextmenu", (e) => {
            const area = e.target.closest("[data-oc-context-menu]");
            const menu = area && document.getElementById(area.dataset.ocContextMenu);
            if (!menu) return;
            e.preventDefault();
            menu.style.setProperty("--oc-context-x", Math.min(e.clientX, innerWidth - 220) + "px");
            menu.style.setProperty("--oc-context-y", Math.min(e.clientY, innerHeight - 220) + "px");
            const show = () => { try { menu.showPopover(); } catch { /* already open */ } };
            // Firefox fires contextmenu while the right button is still down: open after the release.
            if (e.buttons) addEventListener("pointerup", () => setTimeout(show), { once: true });
            else show();
        });
    </script>
@endonce
