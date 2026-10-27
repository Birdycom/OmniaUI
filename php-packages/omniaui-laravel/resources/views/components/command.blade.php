{{-- OmniaCSS command palette markup. Props: items (list of ['group' => ...] | ['separator' => true] | ['label', 'shortcut', 'selected', 'disabled']),
     placeholder, empty (text for the empty state). Slot: extra list items. Filter logic belongs to your own wrapper. --}}
@props(['items' => [], 'placeholder' => 'Type a command or search...', 'empty' => 'No results found.'])
<div {{ $attributes->class(['oc-command'])->merge(['role' => 'combobox', 'aria-expanded' => 'true', 'aria-haspopup' => 'listbox']) }}>
    <input class="oc-command-input" type="search" placeholder="{{ $placeholder }}" aria-label="{{ $placeholder }}">
    <ul class="oc-command-list" role="listbox">
        @foreach ($items as $item)
            @if (! empty($item['group']))
                <li class="oc-command-group-label" role="presentation">{{ $item['group'] }}</li>
            @elseif (! empty($item['separator']))
                <li class="oc-command-separator" role="separator"></li>
            @else
                <li class="oc-command-item" role="option" @if (! empty($item['selected'])) aria-selected="true" @endif @if (! empty($item['disabled'])) aria-disabled="true" @endif>{{ $item['label'] ?? '' }}@if (! empty($item['shortcut'])) <span class="oc-command-shortcut">{{ $item['shortcut'] }}</span>@endif</li>
            @endif
        @endforeach
        {{ $slot }}
    </ul>
    <div class="oc-command-empty" hidden>{{ $empty }}</div>
</div>
