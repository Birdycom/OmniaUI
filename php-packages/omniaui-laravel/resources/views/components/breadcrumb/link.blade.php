{{-- OmniaCSS compound breadcrumb (0.17.1): a level you can go back to, an <a>. Props: href, icon (webicon name before
     the label). Other attributes (wire:navigate …) go to the link. Slot: the label. --}}
@props(['href' => null, 'icon' => null])
<a {{ $attributes->class(['oc-breadcrumb-link'])->merge(array_filter(['href' => $href])) }}>@if ($icon)<x-oc::webicon :name="$icon" bare fallback="iconify" />@endif{{ $slot }}</a>
