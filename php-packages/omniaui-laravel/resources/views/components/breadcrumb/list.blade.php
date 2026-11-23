{{-- OmniaCSS compound breadcrumb (0.17.1): the <ol> inside <x-oc::breadcrumb>. Slot: <x-oc::breadcrumb.item> and
     <x-oc::breadcrumb.separator> (both <li>). The list takes no room of its own (display: contents). --}}
<ol {{ $attributes->class(['oc-breadcrumb-list']) }}>{{ $slot }}</ol>
