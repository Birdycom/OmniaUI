{{-- File: resources/views/components/price-card.blade.php | Map: props -> head -> toggle (radios) -> monthly / yearly / lifetime price -> features -> cta slot
     OmniaUI price card (monthly / yearly switch with radio + :has, no JavaScript; optional third option lifetime).
     Props: name, description, discount, monthly + yearly + lifetime (['amount', 'period'?, 'was'?, 'note'?]; lifetime needs yearly),
     defaultPeriod (monthly|yearly|lifetime),
     features (['label', 'excluded'?] or strings), featured, group (radio name; generated when empty).
     Slot: default = call to action (e.g. <a class="oc-btn oc-price-card__cta">). --}}
@props([
    'name' => '', 'description' => null, 'discount' => null, 'monthly' => [], 'yearly' => null, 'lifetime' => null,
    'defaultPeriod' => 'monthly', 'features' => [], 'featured' => false, 'group' => null,
])
@php
    $group ??= 'oc-price-'.\Illuminate\Support\Str::slug((string) $name).'-'.\Illuminate\Support\Str::random(4);
    $lifetime = $yearly ? $lifetime : null;
    $prices = array_filter(['monthly' => $monthly, 'yearly' => $yearly, 'lifetime' => $lifetime]);
@endphp
<article {{ $attributes->class(['oc-price-card', 'oc-price-card--featured' => $featured]) }}>
    <div class="oc-price-card__head">
        <h3 class="oc-price-card__name">{{ $name }}</h3>
        @if ($discount)
            <span class="oc-price-card__discount">{{ $discount }}</span>
        @endif
    </div>
    @if ($description)
        <p class="oc-price-card__desc">{{ $description }}</p>
    @endif
    @if ($yearly)
        <div class="oc-segmented oc-price-card__toggle" role="radiogroup" aria-label="Billing period">
            <label class="oc-segmented-item"><input type="radio" name="{{ $group }}" value="monthly" @checked($defaultPeriod !== 'yearly' && ! ($defaultPeriod === 'lifetime' && $lifetime))> Monthly</label>
            <label class="oc-segmented-item"><input type="radio" name="{{ $group }}" value="yearly" @checked($defaultPeriod === 'yearly')> Yearly</label>
            @if ($lifetime)
                <label class="oc-segmented-item"><input type="radio" name="{{ $group }}" value="lifetime" @checked($defaultPeriod === 'lifetime')> Lifetime</label>
            @endif
        </div>
    @endif
    @foreach ($prices as $kind => $price)
        <p class="oc-price-card__price oc-price-card__price--{{ $kind }}">
            <span class="oc-price-card__amount">{{ $price['amount'] ?? '' }}</span>
            @isset($price['period'])<span class="oc-price-card__period">{{ $price['period'] }}</span>@endisset
            @isset($price['was'])<s class="oc-price-card__was">{{ $price['was'] }}</s>@endisset
            @isset($price['note'])<span class="oc-price-card__note">{{ $price['note'] }}</span>@endisset
        </p>
    @endforeach
    @if (count($features))
        <ul class="oc-price-card__features">
            @foreach ($features as $feature)
                @php $f = is_array($feature) ? $feature : ['label' => $feature]; @endphp
                <li @class(['oc-price-card__feature', 'oc-price-card__feature--excluded' => ! empty($f['excluded'])])>{{ $f['label'] }}</li>
            @endforeach
        </ul>
    @endif
    {{ $slot }}
</article>
