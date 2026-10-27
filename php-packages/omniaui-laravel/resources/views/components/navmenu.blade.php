{{-- OmniaCSS navmenu. Props: items (list of ['label', 'href', 'current', 'children' => [['label', 'href'] | ['group' => ...]]]), label.
     Items with children render a caret button that opens a dropdown menu (popover). Slot: extra <li> entries. --}}
@props(['items' => [], 'label' => 'Navigation'])
<nav {{ $attributes->merge(['aria-label' => $label]) }}>
    <ul class="oc-navmenu">
        @foreach ($items as $i => $item)
            <li>
                @if (! empty($item['children']))
                    @php($menuId = 'oc-navmenu-'.substr(md5(uniqid('', true)), 0, 6))
                    <button class="oc-navmenu-link oc-navmenu-link--caret" type="button" popovertarget="{{ $menuId }}">{{ $item['label'] }}</button>
                    <div class="oc-dropdown-menu" id="{{ $menuId }}" popover>
                        @foreach ($item['children'] as $child)
                            @if (! empty($child['group']))
                                <div class="oc-dropdown-label">{{ $child['group'] }}</div>
                            @else
                                <a class="oc-dropdown-item" href="{{ $child['href'] ?? '#' }}">{{ $child['label'] ?? '' }}</a>
                            @endif
                        @endforeach
                    </div>
                @else
                    <a class="oc-navmenu-link" href="{{ $item['href'] ?? '#' }}" @if (! empty($item['current'])) aria-current="page" @endif>{{ $item['label'] }}</a>
                @endif
            </li>
        @endforeach
        {{ $slot }}
    </ul>
</nav>
