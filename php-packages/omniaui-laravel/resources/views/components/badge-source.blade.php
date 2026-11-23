{{-- File: resources/views/components/badge-source.blade.php | Map: kind -> span.oc-badge-source | -file | -scss
     OmniaUI source badge: a small pill that says where a piece comes from. Props: kind (source = component, teal; file = path, purple;
     scss = stylesheet, orange). Slot: the text. --}}
@props(['kind' => 'source'])
<span {{ $attributes->class([in_array($kind, ['file', 'scss'], true) ? 'oc-badge-source-'.$kind : 'oc-badge-source']) }}>{{ $slot }}</span>
