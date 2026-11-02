{{-- OmniaUI name card. Props: name, amount, meta, renamable (pencil; needs form-extras.js), total, open.
     Slots: actions (right side), default (content). --}}
@props(['name' => '', 'amount' => null, 'meta' => null, 'renamable' => false, 'total' => false, 'open' => false, 'actions' => null])
<details {{ $attributes->class(['oc-name-card', 'oc-name-card--total' => $total]) }} @if($open) open @endif>
    <summary class="oc-name-card__head">
        <span class="oc-name-card__title">{{ $name }}</span>
        @if ($renamable)
            <button type="button" class="oc-btn oc-btn--plain" data-oc-rename aria-label="Rename {{ $name }}" title="Rename"><iconify-icon icon="mdi:pencil-outline" aria-hidden="true"></iconify-icon></button>
        @endif
        @if ($meta)<span class="oc-name-card__meta">{{ $meta }}</span>@endif
        @if ($amount)<span class="oc-name-card__amount">{{ $amount }}</span>@endif
        @if ($actions)<span class="oc-name-card__actions">{{ $actions }}</span>@endif
    </summary>
    <div class="oc-name-card__body">{{ $slot }}</div>
</details>
