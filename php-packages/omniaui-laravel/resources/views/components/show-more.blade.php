{{-- File: resources/views/components/show-more.blade.php | Map: div.oc-showmore -> slot -> extra slot (hidden) -> toggle label
     OmniaUI show more: text that is always visible and extra text behind a "Show more" toggle button - CSS only
     (the .oc-showmore part of packages/ui/snippets/expandable-table.html). Props: more, less (labels), button-variant (outline|secondary|ghost), open.
     Slots: default (always visible), extra (appears after pressing the button). --}}
@props(['more' => 'Show more', 'less' => 'Show less', 'buttonVariant' => 'outline', 'open' => false])
<div {{ $attributes->class(['oc-showmore']) }}>
    {{ $slot }}
    <div class="oc-showmore__extra">{{ $extra ?? '' }}</div>
    <label class="oc-btn oc-btn--{{ $buttonVariant }} oc-btn--toggle"><input type="checkbox" @checked($open)><span class="oc-btn-toggle__off">{{ $more }}</span><span class="oc-btn-toggle__on">{{ $less }}</span></label>
</div>
