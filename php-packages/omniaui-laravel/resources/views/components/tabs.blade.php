{{-- OmniaCSS tabs (radio inputs + :has(), no JavaScript). Props: name (required), tabs (list of labels, or of
     ['label', 'icon' (webicon name), 'count', 'tone' (success|info|warning: color of the count), 'disabled']), active (0-based index),
     variant (pill|vertical), mode (radio (default) | buttons: class-toggle tabs, button[role=tab] with aria-selected and
     data-oc-tabs; give the panels id="{name}-1", "{name}-2", … and :active on the first; clicks and arrow keys need
     <script type="module" src="/js/oc-tabs.js"></script> (`npx omniaui copy-js tabs`), label (aria-label of the tab list).
     A count gives the tab list .oc-data-table-tabs. Slot: one <x-oc::tabs.panel> per tab, same order.
     Compound (0.17.0): leave out tabs and put <x-oc::tabs.list> with <x-oc::tabs.trigger value="..."> and one
     <x-oc::tabs.content value="..."> per tab in the slot; active = the selected value. Class-toggle tabs (oc-tabs.js for
     clicks and arrow keys). Livewire: model="tab" (or wire:model="tab") makes every trigger $set that property; pass
     :active="$tab" so the server render shows the same tab. module = data-module on the root. --}}
@props(['name', 'tabs' => [], 'active' => 0, 'variant' => null, 'mode' => 'radio', 'label' => null, 'model' => null, 'module' => null])
@if (empty($tabs) && str_contains((string) $slot, 'oc-tab-list'))
<div {{ $attributes->whereDoesntStartWith('wire:model')->class(['oc-tabs'])->merge(['data-module' => $module]) }}>{{ $slot }}</div>
@else
@php
    $items = array_map(fn ($tab) => is_array($tab) ? $tab : ['label' => $tab], array_values($tabs));
    $hasCount = fn ($t) => isset($t['count']) && $t['count'] !== '';
    $counts = collect($items)->contains($hasCount);
    $buttons = $mode === 'buttons';
@endphp
<div {{ $attributes->class(['oc-tabset' => ! $buttons])->merge(['data-module' => $module]) }}>
    <div @class(['oc-tab-list', 'oc-tab-list--'.$variant => $variant, 'oc-data-table-tabs' => $counts]) role="tablist" @if ($label) aria-label="{{ $label }}" @endif @if ($buttons) data-oc-tabs @endif>
        @foreach ($items as $i => $tab)
            @if ($buttons)
                <button class="oc-tab-trigger" type="button" role="tab" aria-selected="{{ $i === (int) $active ? 'true' : 'false' }}" aria-controls="{{ $name }}-{{ $i + 1 }}" @disabled(! empty($tab['disabled']))>
            @else
                <label class="oc-tab-trigger"><input type="radio" name="{{ $name }}" @checked($i === (int) $active) @disabled(! empty($tab['disabled']))>
            @endif
            @if (! empty($tab['icon']))<x-oc::webicon :name="$tab['icon']" bare fallback="iconify" />@endif
            {{ $tab['label'] ?? '' }}
            @if ($hasCount($tab))<span @class(['oc-data-table-tab-count', 'oc-data-table-tab-count--'.($tab['tone'] ?? '') => in_array($tab['tone'] ?? null, ['success', 'info', 'warning'], true)])>{{ $tab['count'] }}</span>@endif
            @if ($buttons)
                </button>
            @else
                </label>
            @endif
        @endforeach
    </div>
    {{ $slot }}
</div>
@endif
