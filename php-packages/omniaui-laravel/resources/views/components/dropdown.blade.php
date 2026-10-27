{{-- OmniaCSS dropdown menu (popover). Props: label (trigger text), variant (trigger button variant), id,
     items (list of ['label', 'href'] | ['group' => ...] | ['separator' => true]). Slots: default = extra items, trigger (replaces the button). --}}
@props(['label' => 'Options', 'variant' => 'outline', 'id' => null, 'items' => []])
@php($id = $id ?: 'oc-menu-'.substr(md5(uniqid('', true)), 0, 6))
@if (isset($trigger) && trim((string) $trigger) !== '')
    {{ $trigger }}
@else
    <button class="oc-btn oc-btn--{{ $variant }}" type="button" popovertarget="{{ $id }}">{{ $label }}</button>
@endif
<div {{ $attributes->class(['oc-dropdown-menu'])->merge(['id' => $id]) }} popover>
    @foreach ($items as $item)
        @if (! empty($item['group']))
            <div class="oc-dropdown-label">{{ $item['group'] }}</div>
        @elseif (! empty($item['separator']))
            <div class="oc-dropdown-separator"></div>
        @else
            <a class="oc-dropdown-item" href="{{ $item['href'] ?? '#' }}">{{ $item['label'] ?? '' }}</a>
        @endif
    @endforeach
    {{ $slot }}
</div>
