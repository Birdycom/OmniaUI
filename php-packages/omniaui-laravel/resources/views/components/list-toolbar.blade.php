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
                <label class="oc-list-toolbar-view" title="{{ $text }}"><input type="radio" name="{{ $name }}" value="{{ $value }}" aria-label="{{ $text }}" @checked($value === $checked)><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">@if ($value === 'cards')<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>@elseif ($value === 'table')<path d="M3 5h18M3 12h18M3 19h18"/>@else<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>@endif</svg></label>
            @endforeach
        </div>
    @endif
    @if (isset($actions) && trim((string) $actions) !== '')
        <div class="oc-list-toolbar-actions">{{ $actions }}</div>
    @endif
</div>
