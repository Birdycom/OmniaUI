{{-- OmniaCSS sidebar. Props: label, collapsed (icon only), right, floating, dark (stays dark in the light theme). Slots: default = content (use <x-oc::sidebar.group> / <x-oc::sidebar.item>), header, footer.
     variant="docs" (0.17.0): the documentation navigation, nav.oc-sidebar.oc-sidebar--docs with title (h2.oc-sidebar-title) and groups
     of text links as plain siblings; <x-oc::sidebar.group> and <x-oc::sidebar.item> inside follow it (no wrappers, labels or tooltips). --}}
@props(['label' => 'Main navigation', 'collapsed' => false, 'right' => false, 'floating' => false, 'dark' => false, 'variant' => 'app', 'title' => null])
@if ($variant === 'docs')
<nav {{ $attributes->class(['oc-sidebar oc-sidebar--docs', 'oc-sidebar--collapsed' => $collapsed])->merge(['aria-label' => $label]) }}>
    @if ($title)
        <h2 class="oc-sidebar-title">{{ $title }}</h2>
    @endif
    {{ $slot }}
</nav>
@else
<aside {{ $attributes->class(['oc-sidebar', 'oc-sidebar--collapsed' => $collapsed, 'oc-sidebar--right' => $right, 'oc-sidebar--floating' => $floating, 'oc-sidebar--dark' => $dark])->merge(array_filter(['aria-label' => $label, 'title' => $title])) }}>
    @if (isset($header) && trim((string) $header) !== '')
        <div class="oc-sidebar-header">{{ $header }}</div>
    @endif
    <div class="oc-sidebar-content">{{ $slot }}</div>
    @if (isset($footer) && trim((string) $footer) !== '')
        <div class="oc-sidebar-footer">{{ $footer }}</div>
    @endif
</aside>
@endif
