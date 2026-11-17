{{-- OmniaUI form section. Props: title, hint, icon (webicon name), name (one open at a time), open, invalid ('error' |
     'warning': your own check found something), issues (count in the header), issues-label.
     Slots: status (right side), default (the fields). --}}
@props(['title' => '', 'hint' => null, 'icon' => null, 'name' => null, 'open' => false, 'status' => null, 'invalid' => null, 'issues' => null, 'issuesLabel' => null])
@php($countLabel = $issuesLabel ?? ($issues.' '.($invalid === 'warning' ? 'warning' : 'error').((int) $issues === 1 ? '' : 's')))
<details {{ $attributes->class(['oc-form-section'])->merge(array_filter(['data-issue' => $invalid])) }} @if($name) name="{{ $name }}" @endif @if($open) open @endif>
    <summary class="oc-form-section__summary">
        <span class="oc-form-section__icon">@if ($icon)<x-oc::webicon :name="$icon" bare fallback="iconify" />@endif</span>
        <span class="oc-form-section__heading">
            <span class="oc-form-section__title">{{ $title }}</span>
            @if ($hint)<span class="oc-form-section__hint">{{ $hint }}</span>@endif
        </span>
        <span class="oc-form-section__status">@if ($invalid && (int) $issues > 0)<span class="oc-form-section__count" role="img" aria-label="{{ $countLabel }}">{{ $issues }}</span>@endif{{ $status }}</span>
    </summary>
    <div class="oc-form-section__body">{{ $slot }}</div>
</details>
