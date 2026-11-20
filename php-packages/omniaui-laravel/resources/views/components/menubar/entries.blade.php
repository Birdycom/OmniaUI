{{-- File: resources/views/components/menubar/entries.blade.php | Map: items -> separator | heading | sub-menu (recursive) | action (menuitem or menuitemcheckbox, shortcut)
     OmniaUI menu items from data (0.17.0), shared by <x-oc::menubar> and <x-oc::context-menu>. Props: items, a list of
     ['label', 'shortcut' => 'Ctrl T', 'checked' => true|false (menuitemcheckbox), 'destructive', 'disabled', 'href' (an <a>),
     'items' => [...] (sub-menu), 'attributes' => ['wire:click' => 'save'] (0.17.0: extra attributes on the item, for Livewire or
     Alpine)] | ['separator' => true] | ['heading' => 'Text']. --}}
@props(['items' => []])
@foreach ($items as $item)
    @if (! empty($item['separator']))
        <div class="oc-dropdown-separator" role="separator"></div>
    @elseif (isset($item['heading']))
        <div class="oc-dropdown-label">{{ $item['heading'] }}</div>
    @elseif (! empty($item['items']))
        <div class="oc-dropdown-sub">
            <button class="oc-dropdown-item" type="button" role="menuitem" aria-haspopup="menu" @disabled(! empty($item['disabled']))>{{ $item['label'] ?? '' }}</button>
            <div class="oc-dropdown-submenu" role="menu"><x-oc::menubar.entries :items="$item['items']" /></div>
        </div>
    @else
        @php
            $check = array_key_exists('checked', $item);
            $tag = isset($item['href']) ? 'a' : 'button';
        @endphp
        @if (empty($item['attributes']))
        <{{ $tag }} @class(['oc-dropdown-item', 'oc-dropdown-item--destructive' => ! empty($item['destructive'])]) @if ($tag === 'a') href="{{ $item['href'] }}" @else type="button" @endif role="{{ $check ? 'menuitemcheckbox' : 'menuitem' }}" @if ($check) aria-checked="{{ $item['checked'] ? 'true' : 'false' }}" @endif @if ($tag === 'button') @disabled(! empty($item['disabled'])) @endif>{{ $item['label'] ?? '' }}@if (isset($item['shortcut'])) <span class="oc-dropdown-shortcut">{{ $item['shortcut'] }}</span>@endif</{{ $tag }}>
        @else
        <{{ $tag }} {{ (new \Illuminate\View\ComponentAttributeBag((array) $item['attributes']))->class(['oc-dropdown-item', 'oc-dropdown-item--destructive' => ! empty($item['destructive'])])->merge(array_filter([
            'href' => $tag === 'a' ? $item['href'] : null,
            'type' => $tag === 'button' ? 'button' : null,
            'role' => $check ? 'menuitemcheckbox' : 'menuitem',
            'aria-checked' => $check ? ($item['checked'] ? 'true' : 'false') : null,
            'disabled' => $tag === 'button' && ! empty($item['disabled']) ? true : null,
        ], fn ($value) => $value !== null)) }}>{{ $item['label'] ?? '' }}@if (isset($item['shortcut'])) <span class="oc-dropdown-shortcut">{{ $item['shortcut'] }}</span>@endif</{{ $tag }}>
        @endif
    @endif
@endforeach
