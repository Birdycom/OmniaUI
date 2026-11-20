{{-- File: resources/views/components/search.blade.php | Map: props -> label.oc-search (icon, input type=search, optional key hint)
     OmniaUI search field (0.17.0), same markup as packages/ui/snippets/search.html. Props: placeholder (also the
     aria-label), hint (key hint on the right, e.g. "/"; hidden while focused), name (default "q"), value.
     `class` goes to the label; other attributes (id, wire:model, autofocus, ...) go to the input. --}}
@props(['placeholder' => null, 'hint' => null, 'name' => 'q', 'value' => null])
<label class="{{ trim('oc-search '.$attributes->get('class')) }}">
    <x-oc::webicon name="mdi:magnify" bare class="oc-search-icon" />
    <input {{ $attributes->except('class')->class(['oc-search-input'])->merge(['type' => 'search', 'name' => $name, 'value' => $value, 'placeholder' => $placeholder, 'aria-label' => $placeholder]) }}>
    @if ($hint !== null)
        <kbd class="oc-search-hint">{{ $hint }}</kbd>
    @endif
</label>
