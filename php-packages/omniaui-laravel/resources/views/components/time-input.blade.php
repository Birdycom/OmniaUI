{{-- File: resources/views/components/time-input.blade.php | Map: props -> 24h text field -> datalist of slots (0.18.0: or the slots in a popover)
     OmniaUI time input (HH:mm). Props: id, slots (list of "HH:mm" suggestions), error.
     Attributes (name, value, wire:model...) go to the input. For a slot list use the snippet markup (.oc-time-slots).
     0.18.0: slots-popover (the slots in a native popover under a clock button, .oc-time-picker, instead of the datalist;
     oc-form-extras.js puts a picked slot into the field with input/change events, so wire:model sees it), slots-label
     (name of the button, default "Choose a time").
     0.18.0: select-on-focus (data-oc-select-on-focus; oc-form-extras.js selects the whole time on focus so the first key
     types over it). Default: on with slots-popover, off otherwise. --}}
@props(['id' => null, 'slots' => [], 'error' => false, 'slotsPopover' => false, 'slotsLabel' => 'Choose a time', 'selectOnFocus' => null])
@php
    $id = $id ?: 'oc-time-'.substr(md5(uniqid('', true)), 0, 6);
    $ocPopover = $slotsPopover && count($slots);
    $ocInput = $attributes->class(['oc-input', 'oc-time-input'])->merge([
        'id' => $id,
        'type' => 'text',
        'inputmode' => 'numeric',
        'maxlength' => '5',
        'placeholder' => 'hh:mm',
        'pattern' => '([01][0-9]|2[0-3]):[0-5][0-9]',
        'list' => count($slots) && ! $ocPopover ? $id.'-slots' : null,
        'aria-invalid' => $error ? 'true' : null,
        'data-oc-select-on-focus' => ($selectOnFocus ?? $slotsPopover) ? '' : null,
    ]);
@endphp
@if ($ocPopover)
<div class="oc-time-picker">
    <input {{ $ocInput }}>
    <button type="button" class="oc-btn oc-btn--outline oc-btn--icon" popovertarget="{{ $id }}-slots" aria-label="{{ $slotsLabel }}" @disabled($attributes->has('disabled') && $attributes->get('disabled') !== false)><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" data-webicon="mdi:clock-outline"><path d="M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7z" /></svg></button>
    <div class="oc-popover" id="{{ $id }}-slots" popover="auto" role="dialog" aria-label="{{ $slotsLabel }}">
        <div class="oc-time-slots" role="radiogroup" aria-label="{{ $slotsLabel }}">
            @foreach ($slots as $slot)
                <label class="oc-time-slot"><input type="radio" name="{{ $id }}-slot" value="{{ $slot }}" @checked((string) $attributes->get('value') === (string) $slot)>{{ $slot }}</label>
            @endforeach
        </div>
    </div>
</div>
@else
<input {{ $ocInput }}>
@if (count($slots))
    <datalist id="{{ $id }}-slots">
        @foreach ($slots as $slot)
            <option value="{{ $slot }}"></option>
        @endforeach
    </datalist>
@endif
@endif
