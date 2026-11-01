{{-- File: resources/views/components/list-toolbar.blade.php | Map: toolbar row -> search slot -> count -> spacer -> view radios (built-in icons) -> actions slot
     OmniaUI list toolbar. Needs @birdycom/omniaui CSS. Wrap toolbar + <div class="oc-list-toolbar-panel" data-view="cards|table|list">
     panels in <div class="oc-list-toolbar-scope"> and the radios switch the panels with CSS only.
     Props: label (toolbar aria-label), count, views (e.g. ['cards' => 'Cards', 'table' => 'Table']), view (checked value),
            name (radio group name), sticky, bordered.
     Slots: search, actions. --}}
@props(['label' => 'List', 'count' => null, 'views' => [], 'view' => null, 'name' => 'oc-list-view', 'sticky' => false, 'bordered' => false, 'search' => null, 'actions' => null])
@php($checked = $view ?? array_key_first($views))
<div {{ $attributes->class(['oc-list-toolbar', 'oc-list-toolbar--sticky' => $sticky, 'oc-list-toolbar--bordered' => $bordered])->merge(['role' => 'toolbar', 'aria-label' => $label]) }}>
    @if (isset($search) && trim((string) $search) !== '')
        <div class="oc-list-toolbar-search">{{ $search }}</div>
    @endif
    @if ($count !== null)
        <span class="oc-list-toolbar-count">{{ $count }}</span>
    @endif
    <span class="oc-list-toolbar-spacer"></span>
    @if (count($views))
        <div class="oc-list-toolbar-views" role="radiogroup" aria-label="View">
            @foreach ($views as $value => $text)
                <label class="oc-list-toolbar-view" title="{{ $text }}"><input type="radio" name="{{ $name }}" value="{{ $value }}" aria-label="{{ $text }}" @checked($value === $checked)><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">@if ($value === 'cards')<path d="M3 11h8V3H3m2 2h4v4H5m8 12h8v-8h-8m2 2h4v4h-4M3 21h8v-8H3m2 2h4v4H5m8-16v8h8V3m-2 6h-4V5h4Z"/>@elseif ($value === 'table')<path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m0 4v4h6V8zm8 0v4h6V8zm-8 6v4h6v-4zm8 0v4h6v-4z"/>@else<path d="M7 5h14v2H7zm0 8v-2h14v2zM4 4.5A1.5 1.5 0 0 1 5.5 6A1.5 1.5 0 0 1 4 7.5A1.5 1.5 0 0 1 2.5 6A1.5 1.5 0 0 1 4 4.5m0 6A1.5 1.5 0 0 1 5.5 12A1.5 1.5 0 0 1 4 13.5A1.5 1.5 0 0 1 2.5 12A1.5 1.5 0 0 1 4 10.5M7 19v-2h14v2zm-3-2.5A1.5 1.5 0 0 1 5.5 18A1.5 1.5 0 0 1 4 19.5A1.5 1.5 0 0 1 2.5 18A1.5 1.5 0 0 1 4 16.5"/>@endif</svg></label>
            @endforeach
        </div>
    @endif
    @if (isset($actions) && trim((string) $actions) !== '')
        <div class="oc-list-toolbar-actions">{{ $actions }}</div>
    @endif
</div>
