{{-- OmniaUI form section. Props: title, hint, icon (webicon name), name (one open at a time), open.
     Slots: status (right side), default (the fields). --}}
@props(['title' => '', 'hint' => null, 'icon' => null, 'name' => null, 'open' => false, 'status' => null])
<details {{ $attributes->class(['oc-form-section']) }} @if($name) name="{{ $name }}" @endif @if($open) open @endif>
    <summary class="oc-form-section__summary">
        <span class="oc-form-section__icon">@if ($icon)<iconify-icon icon="{{ $icon }}" aria-hidden="true"></iconify-icon>@endif</span>
        <span class="oc-form-section__heading">
            <span class="oc-form-section__title">{{ $title }}</span>
            @if ($hint)<span class="oc-form-section__hint">{{ $hint }}</span>@endif
        </span>
        <span class="oc-form-section__status">{{ $status }}</span>
    </summary>
    <div class="oc-form-section__body">{{ $slot }}</div>
</details>
