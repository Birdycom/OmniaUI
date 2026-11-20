{{-- File: resources/views/components/drawer.blade.php | Map: props -> trigger (slot or button with label) -> dialog.oc-drawer (handle, header, body, footer)
     OmniaUI drawer (0.17.0): a bottom sheet on <dialog>, no JavaScript (same markup as packages/ui/snippets/drawer.html).
     Props: id (default a generated one), title, description, label (an outline trigger button with command="show-modal"),
     center (centered from 40rem up), closedby (any|closerequest|none). Slots: default = body, footer (stacked buttons; close
     with command="close" commandfor="{id}"), trigger (replaces the button). --}}
@props(['id' => null, 'title' => null, 'description' => null, 'label' => null, 'center' => false, 'closedby' => 'any'])
@php($id = $id ?: 'oc-drawer-'.substr(md5(uniqid('', true)), 0, 6))
@if (isset($trigger) && trim((string) $trigger) !== '')
    {{ $trigger }}
@elseif ($label !== null)
    <button class="oc-btn oc-btn--outline" type="button" command="show-modal" commandfor="{{ $id }}">{{ $label }}</button>
@endif
<dialog {{ $attributes->class(['oc-drawer', 'oc-drawer--center' => $center])->merge(['id' => $id, 'closedby' => $closedby, 'aria-labelledby' => $title ? $id.'-title' : null]) }}>
    <div class="oc-drawer-content">
        <div class="oc-drawer-handle" aria-hidden="true"></div>
        @if ($title || $description)
            <div class="oc-drawer-header">
                @if ($title)
                    <h2 class="oc-drawer-title" id="{{ $id }}-title">{{ $title }}</h2>
                @endif
                @if ($description)
                    <p class="oc-drawer-description">{{ $description }}</p>
                @endif
            </div>
        @endif
        @if (! $slot->isEmpty())
            <div class="oc-drawer-body">{{ $slot }}</div>
        @endif
        @if (isset($footer) && trim((string) $footer) !== '')
            <div class="oc-drawer-footer">{{ $footer }}</div>
        @endif
    </div>
</dialog>
