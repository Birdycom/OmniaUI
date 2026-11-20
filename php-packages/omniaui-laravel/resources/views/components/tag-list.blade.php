{{-- File: resources/views/components/tag-list.blade.php | Map: ul.oc-tag-list -> li per item -> slot (own li)
     OmniaUI tag list: a wrapping row of rounded chips (tech stack, brands). Props: items, neutral, size (md|lg). Slot: extra <li> chips. --}}
@props(['items' => [], 'neutral' => false, 'size' => 'md'])
<ul {{ $attributes->class(['oc-tag-list', 'oc-tag-list--neutral' => $neutral, 'oc-tag-list--lg' => $size === 'lg']) }}>
    @foreach ($items as $item)
        <li>{{ $item }}</li>
    @endforeach
    {{ $slot }}
</ul>
