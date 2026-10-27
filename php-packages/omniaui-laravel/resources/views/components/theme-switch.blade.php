{{-- OmniaCSS theme switch (CSS only: color-scheme + :has()). Props: name, value (system|light|dark), label. --}}
@props(['name' => 'oc-theme', 'value' => 'system', 'label' => 'Color theme'])
<fieldset {{ $attributes->class(['oc-theme-switch'])->merge(['aria-label' => $label]) }}>
    @foreach (['system' => 'System', 'light' => 'Light', 'dark' => 'Dark'] as $option => $text)
        <label><input type="radio" name="{{ $name }}" value="{{ $option }}" @checked($value === $option)> {{ $text }}</label>
    @endforeach
</fieldset>
