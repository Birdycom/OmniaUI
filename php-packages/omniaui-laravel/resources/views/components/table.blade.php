{{-- OmniaCSS table. Props: caption, striped, compact, borderless, sticky, layout ('auto': columns sized by content).
     Slot: <thead>/<tbody> markup (see table.sort and table.empty); data-hide-below="sm|md|lg" on th/td hides a column in a narrow table. --}}
@props(['caption' => null, 'striped' => false, 'compact' => false, 'borderless' => false, 'sticky' => false, 'layout' => null])
<div class="oc-table-wrap">
    <table {{ $attributes->class(['oc-table', 'oc-table--striped' => $striped, 'oc-table--compact' => $compact, 'oc-table--borderless' => $borderless, 'oc-table--sticky' => $sticky, 'oc-table--auto' => $layout === 'auto']) }}>
        @if ($caption)
            <caption>{{ $caption }}</caption>
        @endif
        {{ $slot }}
    </table>
</div>
