{{-- File: resources/views/components/titlebar-button.blade.php | Map: props -> button.oc-titlebar__btn -> slot (icon)
     OmniaUI title bar button: compact icon button. Props: label (required, for screen readers), close (red on hover). --}}
@props(['label', 'close' => false])
<button {{ $attributes->class(['oc-titlebar__btn', 'oc-titlebar__btn--close' => $close])->merge(['type' => 'button', 'aria-label' => $label, 'title' => $label]) }}>{{ $slot }}</button>
