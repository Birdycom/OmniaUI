{{-- OmniaCSS table empty row. Props: colspan, title, text. Slot: actions. --}}
@props(['colspan' => 1, 'title' => 'Nothing here yet', 'text' => null])
<tr class="oc-table-empty">
    <td colspan="{{ $colspan }}">
        <div class="oc-empty">
            <h3 class="oc-empty-title">{{ $title }}</h3>
            @if ($text)
                <p class="oc-empty-text">{{ $text }}</p>
            @endif
            @if (! $slot->isEmpty())
                <div class="oc-empty-actions">{{ $slot }}</div>
            @endif
        </div>
    </td>
</tr>
