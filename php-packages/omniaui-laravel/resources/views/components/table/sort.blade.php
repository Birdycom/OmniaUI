{{-- OmniaCSS sortable table header cell. Props: href, direction (ascending|descending|null), numeric. Slot: column title. --}}
@props(['href' => '#', 'direction' => null, 'numeric' => false])
<th {{ $attributes->merge(['aria-sort' => $direction]) }} @if ($numeric) data-numeric @endif><a class="oc-table-sort" href="{{ $href }}">{{ $slot }}</a></th>
