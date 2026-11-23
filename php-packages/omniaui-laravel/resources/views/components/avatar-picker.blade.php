{{-- OmniaUI avatar / logo picker (preview by form-extras.js). Props: initials, name (file input), id, label, hint,
     logo (square, contain-fit), src (current image), accept, maxKb (refuse larger files in the browser).
     A server error for the field (@error) shows as .oc-avatar-picker__error.
     0.17.0: wire:model (any wire:model.* modifier) goes to the file input, so a Livewire component with WithFileUploads
     receives the file; input-attributes (array) adds more attributes to the input (e.g. ['x-ref' => 'file', 'required' => true]). --}}
@props(['initials' => '', 'name' => 'avatar', 'id' => null, 'label' => 'Profile picture', 'hint' => null, 'logo' => false, 'src' => null, 'accept' => 'image/*', 'maxKb' => null, 'inputAttributes' => []])
@php
    $id = $id ?? 'oc-avatar-'.$name;
    $input = new \Illuminate\View\ComponentAttributeBag(array_merge($attributes->whereStartsWith('wire:model')->getAttributes(), (array) $inputAttributes));
@endphp
<div {{ $attributes->whereDoesntStartWith('wire:model')->class(['oc-avatar-picker', 'oc-avatar-picker--square oc-avatar-picker--logo' => $logo, 'is-invalid' => isset($errors) && $errors->has($name)]) }} @if($maxKb) data-oc-max-kb="{{ $maxKb }}" @endif>
    <label class="oc-avatar-picker__preview" for="{{ $id }}" title="Choose an image">
        @if ($src)<img src="{{ $src }}" alt="">@endif
        <span data-oc-initials @if($src) hidden @endif>{{ $initials }}</span>
        <input {{ $input->class(['oc-avatar-picker__file'])->merge(['id' => $id, 'name' => $name, 'type' => 'file', 'accept' => $accept]) }}>
    </label>
    <div class="oc-avatar-picker__text">
        <span class="oc-avatar-picker__label">{{ $label }}</span>
        @if ($hint)<span class="oc-avatar-picker__hint">{{ $hint }}</span>@endif
        <div class="oc-avatar-picker__actions">
            <button type="button" class="oc-btn oc-btn--outline oc-btn--sm" data-oc-avatar-upload><x-oc::webicon name="mdi:upload" bare fallback="iconify" />Upload</button>
            <button type="button" class="oc-btn oc-btn--ghost oc-btn--sm" data-oc-avatar-remove><x-oc::webicon name="mdi:close" bare fallback="iconify" />Remove</button>
        </div>
        @isset($errors) @error($name)<span class="oc-avatar-picker__error" role="alert">{{ $message }}</span>@enderror @endisset
    </div>
</div>
