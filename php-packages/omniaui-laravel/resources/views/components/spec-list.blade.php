{{-- OmniaUI spec list. Props: groups (array of ['title' => …, 'rows' => [['label' => …, 'value' => …, 'note' => optional]]]),
     stack (one column). --}}
@props(['groups' => [], 'stack' => false])
<div {{ $attributes->class(['oc-spec-list', 'oc-spec-list--stack' => $stack]) }}>
    @foreach ($groups as $group)
        <section class="oc-spec-group">
            <h3 class="oc-spec-group__title">{{ $group['title'] }}</h3>
            <dl class="oc-spec-group__rows">
                @foreach ($group['rows'] ?? [] as $row)
                    <div class="oc-spec-row"><dt>{{ $row['label'] }}</dt><dd>{{ $row['value'] }}@if (! empty($row['note']))<small>{{ $row['note'] }}</small>@endif</dd></div>
                @endforeach
            </dl>
        </section>
    @endforeach
</div>
