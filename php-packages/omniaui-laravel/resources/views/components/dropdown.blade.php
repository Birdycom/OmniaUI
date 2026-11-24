{{-- OmniaCSS dropdown menu (popover). Props: label (trigger text), variant (trigger button variant), id,
     items (list of ['label', 'href', 'icon' => 'mdi:pencil', 'tone' => 'primary|success|warning|destructive|muted' (icon in a
     tinted square), 'description' => 'Muted second line'] | ['group' => ...] | ['separator' => true]). Icons are inline SVG
     (<x-oc::webicon>, <iconify-icon> when the icon is not on disk). Slots: default = extra items (<x-oc::dropdown.item>,
     .label, .separator, .sub), trigger (replaces the button).
     mode="toggle" (0.17.0): the class-toggle version, .oc-dropdown + .is-open, the menu stays in the page. open: start open
     (with Livewire: your property). trigger-attributes: extra attributes on the trigger button (['wire:click' => 'toggle']).
     script (default true): a small script (once per page) toggles .is-open on a click and closes it on an item click, an
     outside click or Esc; false when your own code (Livewire, Alpine) keeps the state.
     side (top|right|bottom|left) and align (start|center|end) (0.18.0): where the menu opens (data-side / data-align;
     default bottom start, it flips when there is no room). A trigger slot is your own element: give it
     popovertarget="{id}" (pass the same id), there is nothing to merge. --}}
@props(['label' => 'Options', 'variant' => 'outline', 'id' => null, 'items' => [], 'mode' => 'popover', 'open' => false,
    'triggerAttributes' => [], 'script' => true, 'side' => null, 'align' => null])
@php($id = $id ?: 'oc-menu-'.substr(md5(uniqid('', true)), 0, 6))
@php($toggle = $mode === 'toggle')
@if ($toggle)
<div @class(['oc-dropdown', 'is-open' => $open]) @if ($script) data-oc-dropdown @endif>
@endif
@if (isset($trigger) && trim((string) $trigger) !== '')
    {{ $trigger }}
@elseif ($toggle)
    <button {{ (new \Illuminate\View\ComponentAttributeBag((array) $triggerAttributes))->class(['oc-btn', 'oc-btn--'.$variant])->merge(['type' => 'button', 'aria-expanded' => $open ? 'true' : 'false', 'aria-controls' => $id]) }}>{{ $label }}</button>
@else
    <button class="oc-btn oc-btn--{{ $variant }}" type="button" popovertarget="{{ $id }}">{{ $label }}</button>
@endif
<div {{ $attributes->class(['oc-dropdown-menu'])->merge(['id' => $id, 'data-side' => $side || $align ? ($side ?: 'bottom') : null, 'data-align' => $side || $align ? ($align ?: 'start') : null]) }} @unless ($toggle) popover @endunless>
    @foreach ($items as $item)
        @if (! empty($item['group']))
            <div class="oc-dropdown-label">{{ $item['group'] }}</div>
        @elseif (! empty($item['separator']))
            <div class="oc-dropdown-separator"></div>
        @else
            <a class="oc-dropdown-item" href="{{ $item['href'] ?? '#' }}">@if (! empty($item['icon']))<span @class(['oc-dropdown-icon', 'oc-dropdown-icon--'.($item['tone'] ?? '') => ! empty($item['tone'])]) aria-hidden="true"><x-oc::webicon :name="$item['icon']" bare fallback="iconify" /></span>@endif<?php if (! empty($item['description'])): ?><span class="oc-dropdown-text"><span>{{ $item['label'] ?? '' }}</span><span class="oc-dropdown-desc">{{ $item['description'] }}</span></span><?php else: ?>{{ $item['label'] ?? '' }}<?php endif; ?></a>
        @endif
    @endforeach
    {{ $slot }}
</div>
@if ($toggle)
</div>
@if ($script)
@once
    <script>
        // Dropdown (toggle mode): a click on the trigger toggles .is-open; an item click, an outside click or Esc closes it.
        (() => {
            const set = (box, open) => {
                box.classList.toggle("is-open", open);
                box.querySelector(":scope > button[aria-expanded]")?.setAttribute("aria-expanded", String(open));
            };
            document.addEventListener("click", (e) => {
                for (const box of document.querySelectorAll("[data-oc-dropdown].is-open")) if (!box.contains(e.target)) set(box, false);
                const box = e.target.closest("[data-oc-dropdown]");
                if (!box) return;
                if (e.target.closest(".oc-dropdown-menu")) {
                    if (e.target.closest(".oc-dropdown-item:not([role=menuitemcheckbox], [role=menuitemradio], [aria-haspopup])")) set(box, false);
                } else if (e.target.closest("button")) set(box, !box.classList.contains("is-open"));
            });
            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") for (const box of document.querySelectorAll("[data-oc-dropdown].is-open")) set(box, false);
            });
        })();
    </script>
@endonce
@endif
@endif
