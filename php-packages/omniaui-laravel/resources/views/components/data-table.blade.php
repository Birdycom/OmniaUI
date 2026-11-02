{{-- File: resources/views/components/data-table.blade.php | Map: props -> tabs -> toolbar -> filters -> column menu -> rows -> footer
     OmniaUI list table. Load packages/ui/src/data-table.js on the page for the behaviour.
     Props: title, table-id, columns (key, header, numeric, sortable, hideable, defaultHidden, truncate),
     rows (key, status, cells, values, href, actions), page-size, live, search-placeholder, selectable, draggable and resizable
     (grip / width handles; the behaviour is OmniaUI Pro, data-table-pro.js), column-menu (Pro CSS),
     filters (trash pills), archive ("Archive only" pill), importable ("Import CSV" in the settings), variant (default|bordered:
     version 2), striped (true), a column's defaultSort (ascending|descending),
     tabs (column, label, items: value, label, icon, count, tone success|info|warning),
     column-filters (column, label, icon, options: value => label), summary ("Showing {from}–{to} of {total} customers").
     A cell or row['actions'] may be an Illuminate\Support\HtmlString (or a rendered <x-oc::data-table-name>) for rich
     content; give such a cell a plain values[key] for sorting, filtering and search. Slot "pageActions": toolbar buttons. --}}
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
])
@php
    $pageSize = (int) $pageSize;
    $sizes = collect([10, 15, 20, 50, 100, $pageSize])->unique()->sort()->values();
    $lead = ($selectable ? 1 : 0) + ($draggable ? 1 : 0); // the first data column is number lead + 1
    $label = fn ($row) => $row['values']['name'] ?? (is_string($row['cells']['name'] ?? null) ? $row['cells']['name'] : $row['key']);
@endphp
<div @class(['oc-data-table', 'oc-data-table--bordered' => $variant === 'bordered', 'oc-data-table--plain' => ! $striped, 'oc-column-menu-scope' => $columnMenu]) id="{{ $tableId }}" data-page-size="{{ $pageSize }}" @if($live) data-oc-live="true" @endif>
    @if ($tabs)
        <div class="oc-tab-list oc-data-table-tabs" role="tablist" aria-label="{{ $tabs['label'] ?? 'Filter' }}">
            @foreach ($tabs['items'] as $i => $tab)
                <button class="oc-tab-trigger" role="tab" type="button" data-oc-col-filter="{{ $tabs['column'] }}" data-oc-value="{{ $tab['value'] }}" aria-selected="{{ $i === 0 ? 'true' : 'false' }}">@if (!empty($tab['icon']))<iconify-icon icon="{{ $tab['icon'] }}" aria-hidden="true"></iconify-icon>@endif{{ $tab['label'] }}@isset($tab['count'])<span @class(['oc-data-table-tab-count', 'oc-data-table-tab-count--'.($tab['tone'] ?? '') => !empty($tab['tone'])])>{{ $tab['count'] }}</span>@endisset</button>
            @endforeach
        </div>
    @endif
    <div class="oc-data-table-toolbar">
        <div class="oc-data-table-heading">
            <span class="oc-data-table-title">{{ $title }}</span>
            <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" popovertarget="{{ $tableId }}-menu" aria-label="List actions" title="List actions"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 13c-1.86 0-3.41 1.28-3.86 3H2v2h2.14c.45 1.72 2 3 3.86 3s3.41-1.28 3.86-3H22v-2H11.86c-.45-1.72-2-3-3.86-3m0 6c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2M19.86 6c-.45-1.72-2-3-3.86-3s-3.41 1.28-3.86 3H2v2h10.14c.45 1.72 2 3 3.86 3s3.41-1.28 3.86-3H22V6zM16 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2"/></svg></button>
            <div class="oc-dropdown-menu" id="{{ $tableId }}-menu" popover>
                <button class="oc-dropdown-item" type="button" data-oc-export>Export CSV</button>
                @if ($importable)
                    <button class="oc-dropdown-item" type="button" data-oc-import>Import CSV</button>
                    <input class="oc-data-table-file" type="file" accept=".csv,text/csv" data-oc-file>
                @endif
                <button class="oc-dropdown-item" type="button" data-oc-bulk="duplicate">Duplicate selection</button>
                <button class="oc-dropdown-item" type="button" data-oc-bulk="archive">Move selection to trash</button>
                <div class="oc-dropdown-separator"></div>
                <button class="oc-dropdown-item" type="button" data-oc-density="comfortable">Comfortable rows</button>
                <button class="oc-dropdown-item" type="button" data-oc-density="compact">Compact rows</button>
            </div>
        </div>
        <input class="oc-input oc-data-table-search" type="search" placeholder="{{ $searchPlaceholder }}" aria-label="Search {{ $title }}">
        @if ($filters)
            <div class="oc-filter-pills" role="group" aria-label="Trash filter">
                <button class="oc-filter-pill" type="button" data-oc-filter="active" aria-current="true">Active only</button>
                <button class="oc-filter-pill" type="button" data-oc-filter="all">Including trash</button>
                <button class="oc-filter-pill" type="button" data-oc-filter="deleted">Trash only</button>
                @if ($archive)
                    <button class="oc-filter-pill" type="button" data-oc-filter="archived">Archive only</button>
                @endif
            </div>
        @endif
        <div class="oc-data-table-view" role="group" aria-label="View">
            <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" data-oc-view="table" aria-pressed="true" aria-label="Table"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h14v2H7zm0 8v-2h14v2zM4 4.5A1.5 1.5 0 0 1 5.5 6A1.5 1.5 0 0 1 4 7.5A1.5 1.5 0 0 1 2.5 6A1.5 1.5 0 0 1 4 4.5m0 6A1.5 1.5 0 0 1 5.5 12A1.5 1.5 0 0 1 4 13.5A1.5 1.5 0 0 1 2.5 12A1.5 1.5 0 0 1 4 10.5M7 19v-2h14v2zm-3-2.5A1.5 1.5 0 0 1 5.5 18A1.5 1.5 0 0 1 4 19.5A1.5 1.5 0 0 1 2.5 18A1.5 1.5 0 0 1 4 16.5"/></svg></button>
            <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" data-oc-view="grid" aria-label="Cards"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 11h8V3H3m2 2h4v4H5m8 12h8v-8h-8m2 2h4v4h-4M3 21h8v-8H3m2 2h4v4H5m8-16v8h8V3m-2 6h-4V5h4Z"/></svg></button>
        </div>
        @if ($pageActions)
            <div class="oc-data-table-actions">{{ $pageActions }}</div>
        @endif
        <p class="oc-data-table-sort-summary" data-oc-sort-summary role="status"></p>
    </div>
    @if (!empty($columnFilters))
        <div class="oc-data-table-filters" id="{{ $tableId }}-filters">
            @foreach ($columnFilters as $filter)
                <label class="oc-data-table-filter">
                    @if (!empty($filter['icon']))<iconify-icon icon="{{ $filter['icon'] }}" aria-hidden="true"></iconify-icon>@else<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 19.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L9.29 16.7a.99.99 0 0 1-.29-.83v-5.12L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L15 10.75zM7.04 5L11 10.06v5.52l2 2v-7.53L16.96 5z"/></svg>@endif
                    <select class="oc-select" data-oc-col-filter="{{ $filter['column'] }}" aria-label="{{ $filter['label'] }}">
                        @foreach ($filter['options'] as $value => $text)
                            <option value="{{ $value }}" @selected((string) $value === '')>{{ $text }}</option>
                        @endforeach
                    </select>
                </label>
            @endforeach
        </div>
    @endif
    @if ($columnMenu)
    <div class="oc-column-menu" id="{{ $tableId }}-columns" popover>
        <p class="oc-column-menu-title">Columns</p>
        @if ($resizable)
            <button class="oc-dropdown-item" type="button" data-oc-reset-widths>Reset column widths</button>
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
    <div class="oc-data-table-bulk" hidden>
        <span data-oc-selected-count>0 selected</span>
        <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="export">Export selection</button>
        <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="duplicate">Duplicate</button>
        <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="archive">Move to trash</button>
        <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-bulk="restore">Restore</button>
        <button class="oc-btn oc-btn--destructive oc-btn--sm" type="button" data-oc-bulk="delete">Delete permanently</button>
        <button class="oc-btn oc-btn--ghost oc-btn--sm" type="button" data-oc-bulk="clear">Clear</button>
    </div>
    <div class="oc-data-table-frame">
        <div class="oc-data-table-scroll">
            <table class="oc-table oc-data-table-table">
                <thead>
                    <tr>
                        @if ($selectable)
                            <th data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select-all aria-label="Select all"></th>
                        @endif
                        @if ($draggable)
                            <th data-oc-col="order"><span class="oc-visually-hidden">Order</span></th>
                        @endif
                        @foreach ($columns as $column)
                            <th data-oc-col="{{ $column['key'] }}" data-oc-sort="{{ !empty($column['numeric']) ? 'numeric' : 'text' }}" @if(!empty($column['numeric'])) data-numeric @endif @if(!empty($column['defaultSort'])) aria-sort="{{ $column['defaultSort'] }}" @endif>
                                <span class="oc-data-table-th">
                                    @if (($column['sortable'] ?? true) !== false)
                                        <button class="oc-table-sort" type="button">{{ $column['header'] }}</button>
                                    @else
                                        {{ $column['header'] }}
                                    @endif
                                    @if ($resizable)
                                        <span class="oc-data-table-resize" role="separator" aria-orientation="vertical" aria-label="Resize {{ $column['header'] }}"></span>
                                    @endif
                                </span>
                            </th>
                        @endforeach
                        <th data-oc-col="actions"><span class="oc-data-table-th">Actions @if ($columnMenu)<button class="oc-btn oc-btn--plain oc-data-table-columns-btn" type="button" popovertarget="{{ $tableId }}-columns" aria-label="Columns" title="Columns"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 5v13h17V5zm10 2v9h-3V7zM6 7h3v9H6zm13 9h-3V7h3z"/></svg></button>@endif</span></th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($rows as $row)
                        <tr data-oc-row data-oc-key="{{ $row['key'] }}" data-oc-status="{{ $row['status'] ?? 'active' }}" @if(!empty($row['href'])) data-oc-href="{{ $row['href'] }}" @endif>
                            @if ($selectable)
                                <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select aria-label="Select {{ $label($row) }}"></td>
                            @endif
                            @if ($draggable)
                                <td data-oc-col="order" class="oc-sortable-row-grip-cell"><button class="oc-sortable-row-grip" type="button" aria-label="Move {{ $label($row) }}"></button></td>
                            @endif
                            @foreach ($columns as $column)
                                @php($cell = $row['cells'][$column['key']] ?? '')
                                <td data-oc-col="{{ $column['key'] }}" @if(!empty($column['numeric'])) data-numeric @endif @if(isset($row['values'][$column['key']])) data-oc-value="{{ $row['values'][$column['key']] }}" @endif>@if (!empty($column['truncate']) && is_string($cell))<span class="oc-data-table-truncate" style="--oc-data-table-truncate: {{ $column['truncate'] }}" title="{{ $cell }}">{{ $cell }}</span>@else{{ $cell }}@endif</td>
                            @endforeach
                            <td data-oc-col="actions"><div style="display: flex; gap: 0.375rem; justify-content: flex-end">
                                @if (isset($row['actions']))
                                    {{ $row['actions'] }}
                                @else
                                    <button class="oc-btn oc-btn--soft-primary oc-btn--icon oc-btn--sm" type="button" aria-label="Edit {{ $label($row) }}" title="Edit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m14.06 9l.94.94L5.92 19H5v-.92zm3.6-6c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"/></svg></button>
                                @endif
                            </div></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <p class="oc-data-table-empty" hidden>No results</p>
    </div>
    <div class="oc-data-table-footer">
        <p class="oc-data-table-summary" data-oc-summary="{{ $summary }}"></p>
        <label class="oc-data-table-per-page">Rows per page
            <select class="oc-select" data-oc-page-size aria-label="Rows per page">
                @foreach ($sizes as $n)
                    <option value="{{ $n }}" @selected($n === $pageSize)>{{ $n }}</option>
                @endforeach
            </select>
        </label>
        <nav class="oc-data-table-pager" data-oc-pager aria-label="Pagination"></nav>
    </div>
</div>
