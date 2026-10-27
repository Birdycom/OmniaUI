{{-- File: resources/views/components/data-table.blade.php | Map: props -> toolbar -> column menu -> rows -> footer
     OmniaUI list table (Korrekt / OmniaDesk). Load packages/ui/src/data-table.js on the page for the behaviour.
     Props: title, table-id, columns (key, header, numeric, sortable, hideable, defaultHidden), rows (key, status, cells, values, href), page-size, live. --}}
@props([
    'title' => 'List',
    'tableId' => 'oc-data-table',
    'columns' => [],
    'rows' => [],
    'pageSize' => 15,
    'live' => false,
])
@php
    $pageSize = (int) $pageSize;
    $sizes = collect([10, 15, 20, 50, 100, $pageSize])->unique()->sort()->values();
    $lead = 2; // select column + drag column, so the first data column is number 3
@endphp
<div @class(['oc-data-table', 'oc-column-menu-scope']) id="{{ $tableId }}" data-page-size="{{ $pageSize }}" @if($live) data-oc-live="true" @endif>
    <div class="oc-data-table-toolbar">
        <div class="oc-data-table-heading">
            <span class="oc-data-table-title">{{ $title }}</span>
            <button class="oc-btn oc-btn--outline oc-btn--icon oc-btn--sm" type="button" popovertarget="{{ $tableId }}-menu" aria-label="Table actions">⚙</button>
            <div class="oc-dropdown-menu" id="{{ $tableId }}-menu" popover>
                <button class="oc-dropdown-item" type="button" data-oc-export>Export CSV</button>
                <button class="oc-dropdown-item" type="button" data-oc-import>Import CSV</button>
                <input class="oc-data-table-file" type="file" accept=".csv,text/csv" data-oc-file>
                <div class="oc-dropdown-separator"></div>
                <button class="oc-dropdown-item" type="button" data-oc-density="comfortable">Comfortable rows</button>
                <button class="oc-dropdown-item" type="button" data-oc-density="compact">Compact rows</button>
                <button class="oc-dropdown-item" type="button" data-oc-reset-widths>Reset column widths</button>
            </div>
        </div>
        <input class="oc-input oc-data-table-search" type="search" placeholder="Search..." aria-label="Search {{ $title }}">
        <div class="oc-filter-pills" role="group" aria-label="Trash filter">
            <button class="oc-filter-pill" type="button" data-oc-filter="active" aria-current="true">Active only</button>
            <button class="oc-filter-pill" type="button" data-oc-filter="all">Including trash</button>
            <button class="oc-filter-pill" type="button" data-oc-filter="deleted">Trash only</button>
            <button class="oc-filter-pill" type="button" data-oc-filter="archived">Archive only</button>
        </div>
        <div class="oc-data-table-view" role="group" aria-label="View">
            <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-view="table" aria-pressed="true">Table</button>
            <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" data-oc-view="grid">Cards</button>
        </div>
        <p class="oc-data-table-sort-summary" data-oc-sort-summary role="status"></p>
    </div>
    <div class="oc-table-toolbar">
        <span class="oc-table-toolbar-spacer"></span>
        <button class="oc-btn oc-btn--outline oc-btn--sm" type="button" popovertarget="{{ $tableId }}-columns">Columns</button>
    </div>
    <div class="oc-column-menu" id="{{ $tableId }}-columns" popover>
        <p class="oc-column-menu-title">Visible columns</p>
        <form class="oc-column-menu-list">
            @foreach ($columns as $index => $column)
                @continue(($column['hideable'] ?? true) === false)
                <label class="oc-column-menu-item">
                    <input type="checkbox" data-col="{{ $lead + $index + 1 }}" @checked(!($column['defaultHidden'] ?? false))> {{ $column['header'] }}
                </label>
            @endforeach
        </form>
    </div>
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
                        <th data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select-all aria-label="Select all"></th>
                        <th data-oc-col="order"><span class="oc-visually-hidden">Order</span></th>
                        @foreach ($columns as $column)
                            <th data-oc-col="{{ $column['key'] }}" data-oc-sort="{{ !empty($column['numeric']) ? 'numeric' : 'text' }}" @if(!empty($column['numeric'])) data-numeric @endif>
                                <span class="oc-data-table-th">
                                    @if (($column['sortable'] ?? true) !== false)
                                        <button class="oc-table-sort" type="button">{{ $column['header'] }}</button>
                                    @else
                                        {{ $column['header'] }}
                                    @endif
                                    <span class="oc-data-table-resize" role="separator" aria-orientation="vertical" aria-label="Resize {{ $column['header'] }}"></span>
                                </span>
                            </th>
                        @endforeach
                        <th data-oc-col="actions"><span class="oc-visually-hidden">Actions</span></th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($rows as $row)
                        <tr data-oc-row data-oc-key="{{ $row['key'] }}" data-oc-status="{{ $row['status'] ?? 'active' }}" @if(!empty($row['href'])) data-oc-href="{{ $row['href'] }}" @endif>
                            <td data-oc-col="select"><input class="oc-checkbox" type="checkbox" data-oc-select aria-label="Select {{ $row['cells']['name'] ?? $row['key'] }}"></td>
                            <td data-oc-col="order" class="oc-sortable-row-grip-cell"><button class="oc-sortable-row-grip" type="button" aria-label="Move {{ $row['cells']['name'] ?? $row['key'] }}"></button></td>
                            @foreach ($columns as $column)
                                <td data-oc-col="{{ $column['key'] }}" @if(!empty($column['numeric'])) data-numeric @endif @if(isset($row['values'][$column['key']])) data-oc-value="{{ $row['values'][$column['key']] }}" @endif>{{ $row['cells'][$column['key']] ?? '' }}</td>
                            @endforeach
                            <td data-oc-col="actions" class="oc-table-actions"><button class="oc-table-row-action" type="button">Edit</button></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <p class="oc-data-table-empty" hidden>No results</p>
    </div>
    <div class="oc-data-table-footer">
        <p class="oc-data-table-summary" data-oc-summary></p>
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
