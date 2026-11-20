{{-- File: resources/views/components/tree/actions.blade.php | Map: span.oc-tree-actions -> icon action per entry (link or button)
     Row actions of <x-oc::tree> (also usable on its own in a row). Props: actions (list of ['label' (aria-label + title), 'icon' (webicon name),
     'text' (shown without an icon), 'href', 'tone' (primary|success|destructive), 'attributes' (extra attributes, e.g. ['wire:click' => 'rename(3)'])]).
     A button inside a folder row gets onclick="event.preventDefault()" so it does not open or close the folder. --}}
@props(['actions' => []])
<span {{ $attributes->class(['oc-tree-actions']) }}>
    @foreach ($actions as $action)
        @php
            $tone = $action['tone'] ?? null;
            $bag = (new \Illuminate\View\ComponentAttributeBag((array) ($action['attributes'] ?? [])))
                ->class(['oc-table-actions-icon', 'oc-table-actions-icon--'.$tone => $tone && $tone !== 'default'])
                ->merge(['aria-label' => $action['label'], 'title' => $action['label']]);
        @endphp
        @if (! empty($action['href']))
            <a {{ $bag->merge(['href' => $action['href']]) }}>@if (! empty($action['icon']))<x-oc::webicon :name="$action['icon']" bare fallback="iconify" />@else{{ $action['text'] ?? '' }}@endif</a>
        @else
            <button {{ $bag->merge(['type' => 'button', 'onclick' => 'event.preventDefault()']) }}>@if (! empty($action['icon']))<x-oc::webicon :name="$action['icon']" bare fallback="iconify" />@else{{ $action['text'] ?? '' }}@endif</button>
        @endif
    @endforeach
</span>
