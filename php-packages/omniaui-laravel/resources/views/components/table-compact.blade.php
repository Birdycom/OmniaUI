{{-- File: resources/views/components/table-compact.blade.php | Map: wrapper div -> table.oc-table (thead from columns, tbody from rows, tfoot from footer) OR default slot
     OmniaUI table compact: small striped table for inside cards. Needs @birdycom/omniaui CSS.
     Props: columns (['key' => 'Label'] or ['key' => ['label' => 'Qty', 'numeric' => true, 'wrap' => false]]),
            rows (list of ['key' => value]), footer (['key' => value] total row), bordered, plain.
     Slot: your own <table class="oc-table"> when no columns are given. --}}
@props(['columns' => [], 'rows' => [], 'footer' => null, 'bordered' => false, 'plain' => false])
@php
    // Normalise columns to ['label' => ..., 'numeric' => bool, 'wrap' => bool].
    $cols = collect($columns)->map(fn ($c) => is_array($c) ? $c + ['numeric' => false, 'wrap' => false] : ['label' => $c, 'numeric' => false, 'wrap' => false]);
    $cell = fn ($c) => ($c['numeric'] ? ' data-numeric' : '').($c['wrap'] ? ' data-wrap' : '');
@endphp
<div {{ $attributes->class(['oc-table-compact', 'oc-table-compact--bordered' => $bordered, 'oc-table-compact--plain' => $plain]) }}>
    @if ($cols->isNotEmpty())
        <table class="oc-table">
            <thead><tr>@foreach ($cols as $c)<th{!! $cell($c) !!}>{{ $c['label'] }}</th>@endforeach</tr></thead>
            <tbody>
                @foreach ($rows as $row)
                    <tr>@foreach ($cols as $key => $c)<td{!! $cell($c) !!}>{{ $row[$key] ?? '' }}</td>@endforeach</tr>
                @endforeach
            </tbody>
            @if ($footer)
                <tfoot><tr>@foreach ($cols as $key => $c)<td{!! $cell($c) !!}>{{ $footer[$key] ?? '' }}</td>@endforeach</tr></tfoot>
            @endif
        </table>
    @else
        {{ $slot }}
    @endif
</div>
