{{-- OmniaCSS separator. Props: vertical, strong, label (centered text between two lines). --}}
@props(['vertical' => false, 'strong' => false, 'label' => null])
@if ($label !== null)
    <div {{ $attributes->class(['oc-separator-text'])->merge(['role' => 'separator']) }}><span>{{ $label }}</span></div>
@elseif ($vertical)
    <span {{ $attributes->class(['oc-separator', 'oc-separator--vertical', 'oc-separator--strong' => $strong])->merge(['role' => 'separator', 'aria-orientation' => 'vertical']) }}></span>
@else
    <hr {{ $attributes->class(['oc-separator', 'oc-separator--strong' => $strong]) }}>
@endif
