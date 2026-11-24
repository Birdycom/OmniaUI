{{-- File: resources/views/components/stat-list.blade.php | Map: items -> dl.oc-dl.oc-dl--stat -> rows (label + sublabel, value) -> total row
     OmniaUI stat list (0.18.0): a score or cost breakdown, label / value rows in tabular numbers with a total row.
     Props: items ([['label' => 'Questions', 'value' => 120, 'sublabel' => '12 of 15 right'], ...]), total (['label' => 'Total', 'value' => 245]). --}}
@props(['items' => [], 'total' => null])
<dl {{ $attributes->class(['oc-dl', 'oc-dl--stat']) }}>
    @foreach ($items as $item)
        <div class="oc-dl-row">
            <dt class="oc-dl-term">{{ $item['label'] ?? '' }}@if (! empty($item['sublabel']))<span class="oc-dl-sub">{{ $item['sublabel'] }}</span>@endif</dt>
            <dd class="oc-dl-detail">{{ $item['value'] ?? '' }}</dd>
        </div>
    @endforeach
    @if ($total)
        <div class="oc-dl-row oc-dl-row--total">
            <dt class="oc-dl-term">{{ $total['label'] ?? 'Total' }}@if (! empty($total['sublabel']))<span class="oc-dl-sub">{{ $total['sublabel'] }}</span>@endif</dt>
            <dd class="oc-dl-detail">{{ $total['value'] ?? '' }}</dd>
        </div>
    @endif
</dl>
