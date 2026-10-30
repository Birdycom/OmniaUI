{{-- File: resources/views/components/status-dot.blade.php | Map: props -> span.oc-status-dot
     OmniaUI status dot: a live state light; --working pulses. Props: tone (working|waiting|done|error|idle), size (sm|md|lg),
     label (the dot stands alone: role="img"; without it the dot is aria-hidden). --}}
@props(['tone' => null, 'size' => 'md', 'label' => null])
<span {{ $attributes->class([
    'oc-status-dot',
    'oc-status-dot--'.$tone => in_array($tone, ['working', 'waiting', 'done', 'error', 'idle'], true),
    'oc-status-dot--'.$size => in_array($size, ['sm', 'lg'], true),
])->merge($label ? ['role' => 'img', 'aria-label' => $label] : ['aria-hidden' => 'true']) }}></span>
