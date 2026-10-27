{{-- OmniaCSS table. Props: caption, striped, compact, borderless, sticky. Slot: <thead>/<tbody> markup (see table.sort and table.empty). --}}
@props(['caption' => null, 'striped' => false, 'compact' => false, 'borderless' => false, 'sticky' => false])
<div class="oc-table-wrap">
    <table {{ $attributes->class(['oc-table', 'oc-table--striped' => $striped, 'oc-table--compact' => $compact, 'oc-table--borderless' => $borderless, 'oc-table--sticky' => $sticky]) }}>
        @if ($caption)
            <caption>{{ $caption }}</caption>
        @endif
        {{ $slot }}
    </table>
</div>
