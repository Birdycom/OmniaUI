{{-- OmniaCSS radio group. Props: name (required), options (value => label | value => ['label' =>, 'description' =>, 'disabled' =>]), value (checked),
     legend (renders a fieldset), row, card (bordered items), error (true, or a message: shown below the items as
     .oc-field-error and linked to every radio with aria-describedby). Slot: raw <label class="oc-radio-item"> markup after the options. --}}
@props(['name', 'options' => [], 'value' => null, 'legend' => null, 'row' => false, 'card' => false, 'error' => null])
@php
    $invalid = $error ?? (isset($errors) && $errors->has(rtrim((string) $name, '[]')));
    $tag = $legend !== null ? 'fieldset' : 'div';
    $message = is_string($error) && trim($error) !== '' ? $error : null;
    $errorId = $message !== null ? preg_replace('/[^\w-]/', '', (string) $name).'-error' : null;
@endphp
<{{ $tag }} {{ $attributes->class(['oc-radio-group', 'oc-radio-group--row' => $row])->merge($legend === null ? ['role' => 'radiogroup'] : []) }}>
    @if ($legend !== null)
        <legend class="oc-label">{{ $legend }}</legend>
    @endif
    @foreach ($options as $optionValue => $option)
        @php
            $option = is_array($option) ? $option : ['label' => $option];
        @endphp
        <label @class(['oc-radio-item', 'oc-radio-item--card' => $card])>
            <input class="oc-radio" type="radio" name="{{ $name }}" value="{{ $optionValue }}" @checked((string) $value === (string) $optionValue) @disabled(! empty($option['disabled'])) @if ($invalid) aria-invalid="true" @endif @if ($errorId) aria-describedby="{{ $errorId }}" @endif>
            @if (! empty($option['description']))
                <span>{{ $option['label'] ?? '' }}<small>{{ $option['description'] }}</small></span>
            @else
                {{ $option['label'] ?? '' }}
            @endif
        </label>
    @endforeach
    {{ $slot }}
    @if ($message !== null)
        <p class="oc-field-error" id="{{ $errorId }}" role="alert">{{ $message }}</p>
    @endif
</{{ $tag }}>
