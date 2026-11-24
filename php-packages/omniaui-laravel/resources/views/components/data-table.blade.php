{{-- File: resources/views/components/data-table.blade.php | Map: props -> tabs -> toolbar -> filters -> column menu -> rows -> footer
     OmniaUI list table. Load packages/ui/src/data-table.js on the page for the behaviour.
     Props: title, table-id, columns (key, header, numeric, sortable, hideable, defaultHidden, truncate,
     hideBelow / hide-below: sm|md|lg hides the column when the table is narrower than 24, 32 or 48rem),
     rows (key, status, cells, values, href, actions), page-size, live, search-placeholder, selectable, draggable and resizable
     (grip / width handles; the behaviour is OmniaUI Pro, data-table-pro.js), column-menu (Pro CSS),
     filters (trash pills), archive ("Archive only" pill), importable ("Import CSV" in the settings), variant (default|bordered:
     version 2), striped (true), a column's defaultSort (ascending|descending),
     tabs (column, label, items: value, label, icon, count, tone success|info|warning),
     column-filters (column, label, icon, options: value => label), summary ("Showing {from}–{to} of {total} customers").
     A cell or row['actions'] may be an Illuminate\Support\HtmlString (or a rendered <x-oc::data-table-name>) for rich
     content; give such a cell a plain values[key] for sorting, filtering and search. Slot "pageActions": toolbar buttons.
     Badge per cell: a cell ['badge' => 'Active', 'variant' => 'success'], or a column 'badge' => true (every cell a badge) or
     'badge' => ['Active' => 'success', 'Deleted' => 'secondary'] (variant per text); the text is the sort/search value.
     0.17.0: labels (texts in another language, any subset of the keys in \$en below; the script texts selected, summary,
     firstPage, previousPage, nextPage, lastPage, sortedBy, ascending, descending go to data-oc-labels), view (false: no
     table / cards switch), pagination (false: every row on one page), bulk (selection bar; default: as filters).
     0.17.0 server mode: server (the rows are the current page; data-table.js does not filter, sort or slice and fires
     oc-datatable-query instead; answer with updateDataTable), total (all matches), page (1-based), sort (column key, or
     ['key' => …, 'dir' => 'asc|desc']) + sort-dir, search (text in the field), search-delay (ms, default 300), trashed
     (active|all|deleted|archived: the pill that is on), loading (skeleton rows + aria-busy), skeleton-rows,
     visible-columns (list of keys: only those columns render, plus a column chooser in the actions header that fires
     oc-datatable-columns).
     0.17.2: bulk-actions (list of ['key', 'label', 'icon' => webicon name, 'tone' => outline|primary|destructive|ghost,
     'disabled', 'hidden']: the key of a built-in button (export, duplicate, archive, restore, delete, clear) replaces it,
     hidden leaves it out, other keys come before "clear"; a click fires oc-datatable-bulk with that key), and a column's
     width / minWidth (min-width) ("12rem", "20%") on its th. --}}
@props([
    'title' => 'List',
    'tableId' => 'oc-data-table',
    'columns' => [],
    'rows' => [],
    'pageSize' => 15,
    'live' => false,
    'searchPlaceholder' => 'Search...',
    'selectable' => true,
    'draggable' => false,
    'resizable' => false,
    'columnMenu' => false,
    'filters' => true,
    'archive' => true,
    'tabs' => null,
    'columnFilters' => [],
    'summary' => '',
    'importable' => false,
    'variant' => 'default',
    'striped' => true,
    'pageActions' => null,
    'labels' => [],
    'view' => true,
    'pagination' => true,
    'bulk' => null,
    'server' => false,
    'total' => null,
    'page' => null,
    'sort' => null,
    'sortDir' => 'asc',
    'search' => null,
    'searchDelay' => null,
    'trashed' => 'active',
    'loading' => false,
    'skeletonRows' => null,
    'visibleColumns' => null,
    'bulkActions' => [],
])
@php
    $pageSize = (int) $pageSize;
    $sizes = collect([10, 15, 20, 50, 100, $pageSize])->unique()->sort()->values();
    $lead = ($selectable ? 1 : 0) + ($draggable ? 1 : 0); // the first data column is number lead + 1
    $en = [
        'listActions' => 'List actions', 'exportCsv' => 'Export CSV', 'importCsv' => 'Import CSV', 'duplicateSelection' => 'Duplicate selection',
        'trashSelection' => 'Move selection to trash', 'comfortable' => 'Comfortable rows', 'compact' => 'Compact rows', 'search' => 'Search {name}',
        'trashFilter' => 'Trash filter', 'activeOnly' => 'Active only', 'includingTrash' => 'Including trash', 'trashOnly' => 'Trash only',
        'archiveOnly' => 'Archive only', 'view' => 'View', 'table' => 'Table', 'cards' => 'Cards', 'columns' => 'Columns', 'resetWidths' => 'Reset column widths',
        'selected' => '{n} selected', 'exportSelection' => 'Export selection', 'duplicate' => 'Duplicate', 'moveToTrash' => 'Move to trash',
        'restore' => 'Restore', 'deletePermanently' => 'Delete permanently', 'clear' => 'Clear', 'selectAll' => 'Select all', 'select' => 'Select {name}',
        'order' => 'Order', 'move' => 'Move {name}', 'resize' => 'Resize {name}', 'actions' => 'Actions', 'noResults' => 'No results',
        'summary' => 'Showing {from}–{to} of {total}', 'rowsPerPage' => 'Rows per page', 'pagination' => 'Pagination', 'edit' => 'Edit {name}',
    ];
    $L = array_merge($en, (array) $labels);
    $fill = fn (string $text, $name) => str_replace('{name}', (string) $name, $text);
    $bulk = $bulk ?? $filters;
    $scriptKeys = ['selected', 'summary', 'firstPage', 'previousPage', 'nextPage', 'lastPage', 'sortedBy', 'ascending', 'descending'];
    $scriptLabels = array_intersect_key((array) $labels, array_flip($scriptKeys));
    $label = fn ($row) => $row['values']['name'] ?? (is_string($row['cells']['name'] ?? null) ? $row['cells']['name'] : $row['key']);
    // [text, variant] when the cell is a badge: a cell ['badge' => …, 'variant' => …] or a column with 'badge' (true or text => variant).
    $badgeOf = function (array $column, $cell): ?array {
        if (is_array($cell) && isset($cell['badge'])) {
            return [(string) $cell['badge'], $cell['variant'] ?? 'default'];
        }
        if (empty($column['badge']) || ! is_scalar($cell) || (string) $cell === '') {
            return null;
        }

        return [(string) $cell, is_array($column['badge']) ? ($column['badge'][(string) $cell] ?? 'default') : 'default'];
    };
    // 0.17.0: sort as a key or ['key' => …, 'dir' => …]; null = the columns' defaultSort.
    $sortKey = is_array($sort) ? ($sort['key'] ?? null) : $sort;
    $sortDir = is_array($sort) ? ($sort['dir'] ?? $sortDir) : $sortDir;
    $ariaSort = function (array $column) use ($sort, $sortKey, $sortDir): ?string {
        if ($sort === null) {
            return $column['defaultSort'] ?? null;
        }

        return $sortKey === $column['key'] ? ($sortDir === 'desc' ? 'descending' : 'ascending') : null;
    };
    $picker = $visibleColumns !== null;
    $visibleKeys = $picker ? array_map('strval', (array) $visibleColumns) : [];
    $shown = $picker
        ? array_values(array_filter($columns, fn ($c) => ($c['hideable'] ?? true) === false || in_array($c['key'], $visibleKeys, true)))
        : array_values($columns);
    // hideBelow (or hide-below): sm | md | lg -> data-hide-below on the th and its tds (other values are ignored)
    $shown = array_map(function ($c) {
        $hb = $c['hideBelow'] ?? $c['hide-below'] ?? null;
        $c['hideBelow'] = in_array($hb, ['sm', 'md', 'lg'], true) ? $hb : null;

        return $c;
    }, $shown);
    $skeletons = $loading ? (int) ($skeletonRows ?? ($pagination && $pageSize > 0 ? $pageSize : 5)) : 0;
    $trashed = $trashed ?: 'active';
    // 0.17.2: the selection bar buttons, built-in ones merged with bulk-actions (same key = replace, hidden = leave out).
    $bulkKeys = ['export', 'duplicate', 'archive', 'restore', 'delete', 'clear'];
    $bulkText = ['export' => $L['exportSelection'], 'duplicate' => $L['duplicate'], 'archive' => $L['moveToTrash'], 'restore' => $L['restore'], 'delete' => $L['deletePermanently'], 'clear' => $L['clear']];
    $bulkOwn = collect((array) $bulkActions)->keyBy('key');
    $bulkBuiltIn = array_map(fn ($k) => array_merge(['key' => $k, 'label' => $bulkText[$k], 'tone' => ['delete' => 'destructive', 'clear' => 'ghost'][$k] ?? 'outline'], (array) ($bulkOwn[$k] ?? [])), $bulkKeys);
    $bulkExtra = array_values(array_filter((array) $bulkActions, fn ($a) => ! in_array($a['key'] ?? null, $bulkKeys, true)));
    $bulkButtons = array_values(array_filter([...array_slice($bulkBuiltIn, 0, -1), ...$bulkExtra, $bulkBuiltIn[5]], fn ($a) => empty($a['hidden'])));
    // 0.17.2: column width / min-width on the th.
    $colStyle = function (array $c): ?string {
        $w = $c['width'] ?? null;
        $min = $c['minWidth'] ?? $c['min-width'] ?? null;
        $css = ($w ? 'width: '.$w.';' : '').($min ? ($w ? ' ' : '').'min-width: '.$min.';' : '');

        return $css !== '' ? $css : null;
    };
@endphp
<div @class(['oc-data-table', 'oc-data-table--bordered' => $variant === 'bordered', 'oc-data-table--plain' => ! $striped, 'oc-column-menu-scope' => $columnMenu]) id="{{ $tableId }}" data-page-size="{{ $pagination ? $pageSize : 0 }}" @if($scriptLabels) data-oc-labels="{{ json_encode($scriptLabels, JSON_UNESCAPED_UNICODE) }}" @endif @unless($view) data-oc-no-grid @endunless @if($live) data-oc-live="true" @endif @if($server) data-oc-server="true" data-oc-total="{{ $total ?? count($rows) }}" data-oc-current-page="{{ $page ?? 1 }}" @endif @if($searchDelay !== null) data-oc-search-delay="{{ (int) $searchDelay }}" @endif @if($loading) aria-busy="true" @endif>
    @if ($tabs)
        <div class="oc-tab-list oc-data-table-tabs" role="tablist" aria-label="{{ $tabs['label'] ?? 'Filter' }}">
            @foreach ($tabs['items'] as $i => $tab)
                <button class="oc-tab-trigger" role="tab" type="button" data-oc-col-filter="{{ $tabs['column'] }}" data-oc-value="{{ $tab['value'] }}" aria-selected="{{ $i === 0 ? 'true' : 'false' }}">@if (!empty($tab['icon']))<x-oc::webicon :name="$tab['icon']" bare fallback="iconify" />@endif{{ $tab['label'] }}@isset($tab['count'])<span @class(['oc-data-table-tab-count', 'oc-data-table-tab-count--'.($tab['tone'] ?? '') => !empty($tab['tone'])])>{{ $tab['count'] }}</span>@endisset</button>
            @endforeach
        </div>
    @endif
    <div class="oc-data-table-toolbar">
        <div class="oc-data-table-heading">
            <span class="oc-data-table-title">{{ $title }}</span>
            <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" popovertarget="{{ $tableId }}-menu" aria-label="{{ $L['listActions'] }}" title="{{ $L['listActions'] }}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 13c-1.86 0-3.41 1.28-3.86 3H2v2h2.14c.45 1.72 2 3 3.86 3s3.41-1.28 3.86-3H22v-2H11.86c-.45-1.72-2-3-3.86-3m0 6c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2M19.86 6c-.45-1.72-2-3-3.86-3s-3.41 1.28-3.86 3H2v2h10.14c.45 1.72 2 3 3.86 3s3.41-1.28 3.86-3H22V6zM16 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2"/></svg></button>
            <div class="oc-dropdown-menu" id="{{ $tableId }}-menu" popover>
                <button class="oc-dropdown-item" type="button" data-oc-export>{{ $L['exportCsv'] }}</button>
                @if ($importable)
                    <button class="oc-dropdown-item" type="button" data-oc-import>{{ $L['importCsv'] }}</button>
                    <input class="oc-data-table-file" type="file" accept=".csv,text/csv" data-oc-file>
                @endif
                @if ($bulk)
                <button class="oc-dropdown-item" type="button" data-oc-bulk="duplicate">{{ $L['duplicateSelection'] }}</button>
                <button class="oc-dropdown-item" type="button" data-oc-bulk="archive">{{ $L['trashSelection'] }}</button>
                @endif
                <div class="oc-dropdown-separator"></div>
                <button class="oc-dropdown-item" type="button" data-oc-density="comfortable">{{ $L['comfortable'] }}</button>
                <button class="oc-dropdown-item" type="button" data-oc-density="compact">{{ $L['compact'] }}</button>
            </div>
        </div>
        <input class="oc-input oc-data-table-search" type="search" placeholder="{{ $searchPlaceholder }}" aria-label="{{ $fill($L['search'], $title) }}" @if($search !== null && $search !== '') value="{{ $search }}" @endif>
        @if ($filters)
            <div class="oc-filter-pills" role="group" aria-label="{{ $L['trashFilter'] }}">
                <button class="oc-filter-pill" type="button" data-oc-filter="active" @if($trashed === 'active') aria-current="true" @endif>{{ $L['activeOnly'] }}</button>
                <button class="oc-filter-pill" type="button" data-oc-filter="all" @if($trashed === 'all') aria-current="true" @endif>{{ $L['includingTrash'] }}</button>
                <button class="oc-filter-pill" type="button" data-oc-filter="deleted" @if($trashed === 'deleted') aria-current="true" @endif>{{ $L['trashOnly'] }}</button>
                @if ($archive)
                    <button class="oc-filter-pill" type="button" data-oc-filter="archived" @if($trashed === 'archived') aria-current="true" @endif>{{ $L['archiveOnly'] }}</button>
                @endif
            </div>
        @endif
        @if ($view)
        <div class="oc-data-table-view" role="group" aria-label="{{ $L['view'] }}">
            <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" data-oc-view="table" aria-pressed="true" aria-label="{{ $L['table'] }}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h14v2H7zm0 8v-2h14v2zM4 4.5A1.5 1.5 0 0 1 5.5 6A1.5 1.5 0 0 1 4 7.5A1.5 1.5 0 0 1 2.5 6A1.5 1.5 0 0 1 4 4.5m0 6A1.5 1.5 0 0 1 5.5 12A1.5 1.5 0 0 1 4 13.5A1.5 1.5 0 0 1 2.5 12A1.5 1.5 0 0 1 4 10.5M7 19v-2h14v2zm-3-2.5A1.5 1.5 0 0 1 5.5 18A1.5 1.5 0 0 1 4 19.5A1.5 1.5 0 0 1 2.5 18A1.5 1.5 0 0 1 4 16.5"/></svg></button>
            <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" data-oc-view="grid" aria-label="{{ $L['cards'] }}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 11h8V3H3m2 2h4v4H5m8 12h8v-8h-8m2 2h4v4h-4M3 21h8v-8H3m2 2h4v4H5m8-16v8h8V3m-2 6h-4V5h4Z"/></svg></button>
        </div>
        @endif
        @if ($pageActions)
            <div class="oc-data-table-actions">{{ $pageActions }}</div>
        @endif
        <p class="oc-data-table-sort-summary" data-oc-sort-summary role="status"></p>
    </div>
    @if (!empty($columnFilters))
        <div class="oc-data-table-filters" id="{{ $tableId }}-filters">
            @foreach ($columnFilters as $filter)
                <label class="oc-data-table-filter">
                    @if (!empty($filter['icon']))<x-oc::webicon :name="$filter['icon']" bare fallback="iconify" />@else<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 19.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L9.29 16.7a.99.99 0 0 1-.29-.83v-5.12L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L15 10.75zM7.04 5L11 10.06v5.52l2 2v-7.53L16.96 5z"/></svg>@endif
                    <select class="oc-select" data-oc-col-filter="{{ $filter['column'] }}" aria-label="{{ $filter['label'] }}">
                        @foreach ($filter['options'] as $value => $text)
                            <option value="{{ $value }}" @selected((string) $value === '')>{{ $text }}</option>
                        @endforeach
                    </select>
                </label>
            @endforeach
        </div>
    @endif
    @if ($picker)
    <div class="oc-dropdown-menu oc-data-table-colpick" id="{{ $tableId }}-colpick" popover>
        <p class="oc-data-table-colpick-title">{{ $L['columns'] }}</p>
        @foreach ($columns as $column)
            @php($locked = ($column['hideable'] ?? true) === false)
            <label class="oc-dropdown-item"><input type="checkbox" data-oc-visible-col="{{ $column['key'] }}" @checked($locked || in_array($column['key'], $visibleKeys, true)) @disabled($locked)> {{ $column['header'] }}</label>
        @endforeach
    </div>
    @endif
    @if ($columnMenu && ! $picker)
    <div class="oc-column-menu" id="{{ $tableId }}-columns" popover>
        <p class="oc-column-menu-title">{{ $L['columns'] }}</p>
        @if ($resizable)
            <button class="oc-dropdown-item" type="button" data-oc-reset-widths>{{ $L['resetWidths'] }}</button>
            <div class="oc-dropdown-separator"></div>
        @endif
        <form class="oc-column-menu-list">
            @foreach ($columns as $index => $column)
                @continue(($column['hideable'] ?? true) === false)
                <label class="oc-column-menu-item">
                    <input type="checkbox" data-col="{{ $lead + $index + 1 }}" @checked(!($column['defaultHidden'] ?? false))> {{ $column['header'] }}
                </label>
            @endforeach
        </form>
    </div>
    @endif
    @if ($bulk)
    <div class="oc-data-table-bulk" hidden>
        <span data-oc-selected-count>{{ str_replace('{n}', '0', $L['selected']) }}</span>
        @foreach ($bulkButtons as $action)
        <button @class(['oc-btn', 'oc-btn--'.($action['tone'] ?? 'outline') => ($action['tone'] ?? 'outline') !== 'primary', 'oc-btn--sm']) type="button" data-oc-bulk="{{ $action['key'] }}" @disabled(! empty($action['disabled']))>@if (! empty($action['icon']))<x-oc::webicon :name="$action['icon']" bare fallback="iconify" />@endif{{ $action['label'] ?? $action['key'] }}</button>
        @endforeach
    </div>
    @endif
    <div class="oc-data-table-frame">
        <div class="oc-data-table-scroll">
            <table class="oc-table oc-data-table-table">
                <thead>
                    <tr>
                        @if ($selectable)
                            <th data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select-all aria-label="{{ $L['selectAll'] }}"></th>
                        @endif
                        @if ($draggable)
                            <th data-oc-col="order"><span class="oc-visually-hidden">{{ $L['order'] }}</span></th>
                        @endif
                        @foreach ($shown as $column)
                            @php($sorted = $ariaSort($column))
                            <th data-oc-col="{{ $column['key'] }}" data-oc-sort="{{ !empty($column['numeric']) ? 'numeric' : 'text' }}" @if(!empty($column['numeric'])) data-numeric @endif @if($column['hideBelow']) data-hide-below="{{ $column['hideBelow'] }}" @endif @if($sorted) aria-sort="{{ $sorted }}" @endif @if($colStyle($column)) style="{{ $colStyle($column) }}" @endif>
                                <span class="oc-data-table-th">
                                    @if (($column['sortable'] ?? true) !== false)
                                        <button class="oc-table-sort" type="button">{{ $column['header'] }}</button>
                                    @else
                                        {{ $column['header'] }}
                                    @endif
                                    @if ($resizable)
                                        <span class="oc-data-table-resize" role="separator" aria-orientation="vertical" aria-label="{{ $fill($L['resize'], $column['header']) }}"></span>
                                    @endif
                                </span>
                            </th>
                        @endforeach
                        <th data-oc-col="actions"><span class="oc-data-table-th">{{ $L['actions'] }} @if ($columnMenu || $picker)<button class="oc-btn oc-btn--plain oc-data-table-columns-btn" type="button" popovertarget="{{ $tableId }}-{{ $picker ? 'colpick' : 'columns' }}" aria-label="{{ $L['columns'] }}" title="{{ $L['columns'] }}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 5v13h17V5zm10 2v9h-3V7zM6 7h3v9H6zm13 9h-3V7h3z"/></svg></button>@endif</span></th>
                    </tr>
                </thead>
                <tbody>
                    @for ($i = 0; $i < $skeletons; $i++)
                        <tr class="oc-data-table-skeleton" aria-hidden="true">
                            @if ($selectable)<td data-oc-col="select"><span class="oc-skeleton oc-data-table-skeleton-box"></span></td>@endif
                            @if ($draggable)<td data-oc-col="order"></td>@endif
                            @foreach ($shown as $column)<td @if(!empty($column['numeric'])) data-numeric @endif @if($column['hideBelow']) data-hide-below="{{ $column['hideBelow'] }}" @endif><span class="oc-skeleton oc-data-table-skeleton-bar"></span></td>@endforeach
                            <td data-oc-col="actions"></td>
                        </tr>
                    @endfor
                    @foreach ($loading ? [] : $rows as $row)
                        <tr data-oc-row data-oc-key="{{ $row['key'] }}" data-oc-status="{{ $row['status'] ?? 'active' }}" @if(!empty($row['href'])) data-oc-href="{{ $row['href'] }}" @endif>
                            @if ($selectable)
                                <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select aria-label="{{ $fill($L['select'], $label($row)) }}"></td>
                            @endif
                            @if ($draggable)
                                <td data-oc-col="order" class="oc-sortable-row-grip-cell"><button class="oc-sortable-row-grip" type="button" aria-label="{{ $fill($L['move'], $label($row)) }}"></button></td>
                            @endif
                            @foreach ($shown as $column)
                                @php($cell = $row['cells'][$column['key']] ?? '')
                                @php($badge = $badgeOf($column, $cell))
                                <td data-oc-col="{{ $column['key'] }}" @if(!empty($column['numeric'])) data-numeric @endif @if($column['hideBelow']) data-hide-below="{{ $column['hideBelow'] }}" @endif @if(isset($row['values'][$column['key']])) data-oc-value="{{ $row['values'][$column['key']] }}" @elseif($badge) data-oc-value="{{ $badge[0] }}" @endif>@if ($badge)<span @class(['oc-badge', 'oc-badge--'.$badge[1] => ! in_array($badge[1], ['default', 'primary', null, ''], true)])>{{ $badge[0] }}</span>@elseif (!empty($column['truncate']) && is_string($cell))<span class="oc-data-table-truncate" style="--oc-data-table-truncate: {{ $column['truncate'] }}" title="{{ $cell }}">{{ $cell }}</span>@else{{ $cell }}@endif</td>
                            @endforeach
                            <td data-oc-col="actions"><div style="display: flex; gap: 0.375rem; justify-content: flex-end">
                                @if (isset($row['actions']))
                                    {{ $row['actions'] }}
                                @else
                                    <button class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" type="button" aria-label="{{ $fill($L['edit'], $label($row)) }}" title="{{ trim($fill($L['edit'], '')) }}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></button>
                                @endif
                            </div></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <p class="oc-data-table-empty" hidden>{{ $L['noResults'] }}</p>
    </div>
    <div class="oc-data-table-footer">
        <p class="oc-data-table-summary" data-oc-summary="{{ $summary ?: ($labels['summary'] ?? '') }}"></p>
        @if ($pagination)
        <label class="oc-data-table-per-page">{{ $L['rowsPerPage'] }}
            <select class="oc-select" data-oc-page-size aria-label="{{ $L['rowsPerPage'] }}">
                @foreach ($sizes as $n)
                    <option value="{{ $n }}" @selected($n === $pageSize)>{{ $n }}</option>
                @endforeach
            </select>
        </label>
        <nav class="oc-data-table-pager" data-oc-pager aria-label="{{ $L['pagination'] }}"></nav>
        @endif
    </div>
</div>
