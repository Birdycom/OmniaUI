{{-- File: resources/views/components/stack-list.blade.php | Map: props -> ul.oc-stack-list -> li pills -> default slot
     OmniaUI stack list (tech pills). Props: items (strings, or ['label', 'icon'?]), neutral, size (default|sm).
     Slot: default = extra <li class="oc-stack-list__item">. Accent: class="oc-accent--violet". --}}
@props(['items' => [], 'neutral' => false, 'size' => 'default'])
<ul {{ $attributes->class(['oc-stack-list', 'oc-stack-list--neutral' => $neutral, 'oc-stack-list--sm' => $size === 'sm']) }}>
    @foreach ($items as $item)
        <li class="oc-stack-list__item">
            @if (is_array($item))
                @if (! empty($item['icon']))<span class="oc-stack-list__icon" aria-hidden="true">{{ $item['icon'] }}</span>@endif{{ $item['label'] }}
            @else
                {{ $item }}
            @endif
        </li>
    @endforeach
    {{ $slot }}
</ul>
