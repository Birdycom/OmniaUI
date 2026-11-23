{{-- File: resources/views/components/expandable-table.blade.php | Map: wrapper -> table (first rows, dimmed row, hidden rows) or slot -> toggle label
     OmniaUI expandable table: shows the first rows, "Show more" reveals the rest - CSS only (packages/ui/snippets/expandable-table.html).
     Props: columns (key => label), rows (list of [key => value]; an HtmlString renders as markup), visible (rows before the button, default 10),
            table-class (default oc-table-ref), more, less (button labels), full (button over the full width, default true),
            button-variant (secondary|outline|ghost), open (start open).
     Slot: your own <table> with .oc-expandable-table__row-dimmed / __row-more rows when no columns are given. --}}
@props(['columns' => [], 'rows' => [], 'visible' => 10, 'tableClass' => 'oc-table-ref', 'more' => 'Show more', 'less' => 'Show less', 'full' => true, 'buttonVariant' => 'secondary', 'open' => false])
@php
    $visible = (int) $visible;
    $total = count($rows);
@endphp
<div {{ $attributes->class(['oc-expandable-table']) }}>
    @if ($columns)
        <table class="{{ $tableClass }}">
            <thead><tr>@foreach ($columns as $label)<th>{{ $label }}</th>@endforeach</tr></thead>
            <tbody>
                @foreach (array_values($rows) as $i => $row)
                    <tr @class(['oc-expandable-table__row-dimmed' => $i === $visible - 1 && $total > $visible, 'oc-expandable-table__row-more' => $i >= $visible])>@foreach ($columns as $key => $label)<td>{{ $row[$key] ?? '' }}</td>@endforeach</tr>
                @endforeach
            </tbody>
        </table>
    @else
        {{ $slot }}
    @endif
    <div @class(['oc-expandable-table__wrap', 'oc-expandable-table__wrap--full' => $full])>
        <label class="oc-btn oc-btn--{{ $buttonVariant }} oc-expandable-table__trigger"><input type="checkbox" class="oc-expandable-table__toggle" @checked($open)><span class="oc-expandable-table__more">{{ $more }}</span><span class="oc-expandable-table__less">{{ $less }}</span></label>
    </div>
</div>
