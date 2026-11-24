{{-- OmniaCSS one-time-code input. Props: length (default 6), label, description, id, name, error, fit (cells shrink with
     the parent), group (a divider after every n cells), alphanumeric, block (0.18.0: full width, the cells share it),
     size (0.18.0: lg = larger digits), tiles (0.18.0: a tile per character with a bar under it). Attributes (wire:model, ...) go to the input. --}}
@props(['length' => 6, 'label' => null, 'description' => null, 'id' => null, 'name' => 'code', 'error' => false, 'fit' => false, 'group' => null, 'alphanumeric' => false, 'block' => false, 'size' => 'md', 'tiles' => false])
@php($id = $id ?: 'oc-otp-'.substr(md5(uniqid('', true)), 0, 6))
<div class="oc-field">
    @if ($label)
        <label class="oc-field-label" for="{{ $id }}">{{ $label }}</label>
    @endif
    <input {{ $attributes->class(['oc-otp', 'oc-otp--fit' => $fit, 'oc-otp--group' => $group, 'oc-otp--block' => $block, 'oc-otp--lg' => $size === 'lg', 'oc-otp--tiles' => $tiles])->merge(array_filter(['id' => $id, 'name' => $name, 'type' => 'text', 'inputmode' => $alphanumeric ? 'text' : 'numeric', 'autocomplete' => 'one-time-code', 'maxlength' => $length, 'pattern' => $alphanumeric ? null : '[0-9]*', 'style' => '--oc-otp-length: '.(int) $length.($group ? '; --oc-otp-group: '.(int) $group : '')])) }} @if ($error) aria-invalid="true" @endif>
    @if ($description)
        <p class="oc-field-description">{{ $description }}</p>
    @endif
</div>
