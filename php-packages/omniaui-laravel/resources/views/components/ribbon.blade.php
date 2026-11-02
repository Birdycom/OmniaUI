{{-- OmniaUI corner ribbon. Props: corner (top-start|top-end|bottom-start|bottom-end), tone (primary|success|warning|destructive|muted), size (sm|md|lg). Slot = the text. --}}
@props(['corner' => 'top-end', 'tone' => 'primary', 'size' => 'md'])
<span {{ $attributes->class(['oc-ribbon', 'oc-ribbon--'.$corner => $corner !== 'top-end', 'oc-ribbon--'.$tone => $tone !== 'primary', 'oc-ribbon--'.$size => $size !== 'md']) }}>{{ $slot }}</span>
