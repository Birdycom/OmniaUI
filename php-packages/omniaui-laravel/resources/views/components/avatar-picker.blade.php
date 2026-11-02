{{-- OmniaUI avatar / logo picker (preview by form-extras.js). Props: initials, name (file input), id, label, hint,
     logo (square, contain-fit), src (current image), accept. --}}
@props(['initials' => '', 'name' => 'avatar', 'id' => null, 'label' => 'Profile picture', 'hint' => null, 'logo' => false, 'src' => null, 'accept' => 'image/*'])
@php($id = $id ?? 'oc-avatar-'.$name)
<div {{ $attributes->class(['oc-avatar-picker', 'oc-avatar-picker--square oc-avatar-picker--logo' => $logo]) }}>
    <label class="oc-avatar-picker__preview" for="{{ $id }}" title="Choose an image">
        @if ($src)<img src="{{ $src }}" alt="">@endif
        <span data-oc-initials @if($src) hidden @endif>{{ $initials }}</span>
        <input class="oc-avatar-picker__file" id="{{ $id }}" name="{{ $name }}" type="file" accept="{{ $accept }}">
    </label>
    <div class="oc-avatar-picker__text">
        <span class="oc-avatar-picker__label">{{ $label }}</span>
        @if ($hint)<span class="oc-avatar-picker__hint">{{ $hint }}</span>@endif
        <div class="oc-avatar-picker__actions">
            <button type="button" class="oc-btn oc-btn--outline oc-btn--sm" data-oc-avatar-upload><iconify-icon icon="mdi:upload" aria-hidden="true"></iconify-icon>Upload</button>
            <button type="button" class="oc-btn oc-btn--ghost oc-btn--sm" data-oc-avatar-remove><iconify-icon icon="mdi:close" aria-hidden="true"></iconify-icon>Remove</button>
        </div>
    </div>
</div>
