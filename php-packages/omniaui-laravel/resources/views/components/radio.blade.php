{{-- OmniaCSS radio group. Props: name (required), options (value => label | value => ['label' =>, 'description' =>, 'disabled' =>]), value (checked),
     legend (renders a fieldset), row, card (bordered items), error. Slot: raw <label class="oc-radio-item"> markup after the options. --}}
@props(['name', 'options' => [], 'value' => null, 'legend' => null, 'row' => false, 'card' => false, 'error' => null])
@php
    $invalid = $error ?? (isset($errors) && $errors->has(rtrim((string) $name, '[]')));
    $tag = $legend !== null ? 'fieldset' : 'div';
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
            <input class="oc-radio" type="radio" name="{{ $name }}" value="{{ $optionValue }}" @checked((string) $value === (string) $optionValue) @disabled(! empty($option['disabled'])) @if ($invalid) aria-invalid="true" @endif>
            @if (! empty($option['description']))
                <span>{{ $option['label'] ?? '' }}<small>{{ $option['description'] }}</small></span>
            @else
                {{ $option['label'] ?? '' }}
            @endif
        </label>
    @endforeach
    {{ $slot }}
</{{ $tag }}>
