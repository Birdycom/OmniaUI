{{-- File: resources/views/components/link-arrow.blade.php | Map: props -> a.oc-link-arrow + modifiers
     OmniaUI link arrow. Props: href, direction (forward|back|external), tone (default|accent|muted), size (sm|default|lg). Slot: text. --}}
@props(['href' => '#', 'direction' => 'forward', 'tone' => 'default', 'size' => 'default'])
<a {{ $attributes->class([
    'oc-link-arrow',
    'oc-link-arrow--'.$direction => in_array($direction, ['back', 'external'], true),
    'oc-link-arrow--'.$tone => in_array($tone, ['accent', 'muted'], true),
    'oc-link-arrow--'.$size => in_array($size, ['sm', 'lg'], true),
])->merge(['href' => $href]) }}>{{ $slot }}</a>
