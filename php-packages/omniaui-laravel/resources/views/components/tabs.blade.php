{{-- OmniaCSS tabs (radio inputs + :has(), no JavaScript). Props: name (required), tabs (list of labels), active (0-based index), variant (pill|vertical).
     Slot: one <x-oc::tabs.panel> per tab, same order. --}}
@props(['name', 'tabs' => [], 'active' => 0, 'variant' => null])
<div {{ $attributes->class(['oc-tabset']) }}>
    <div @class(['oc-tab-list', 'oc-tab-list--'.$variant => $variant]) role="tablist">
        @foreach ($tabs as $i => $tab)
            <label class="oc-tab-trigger"><input type="radio" name="{{ $name }}" @checked($i === (int) $active)> {{ $tab }}</label>
        @endforeach
    </div>
    {{ $slot }}
</div>
