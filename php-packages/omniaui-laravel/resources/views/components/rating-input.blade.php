{{-- OmniaUI rating input: five radio buttons drawn as stars (CSS only). Props: name (required for a form), value (1-5),
     legend ("Rating"), size (sm|md|lg), disabled. --}}
@props(['name' => 'rating', 'value' => null, 'legend' => 'Rating', 'size' => 'md', 'disabled' => false])
<fieldset {{ $attributes->class(['oc-rating-input', 'oc-rating-input--'.$size => $size !== 'md']) }} @disabled($disabled)>
    <legend>{{ $legend }}</legend>
    @foreach (range(1, 5) as $n)
        <label><input type="radio" name="{{ $name }}" value="{{ $n }}" @checked((int) $value === $n)><span>{{ $n === 1 ? '1 star' : $n.' stars' }}</span></label>
    @endforeach
</fieldset>
