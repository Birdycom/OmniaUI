{{-- File: resources/views/components/calendar.blade.php | Map: props -> month grid (6 weeks) -> header (previous / next links) -> table
     (weekdays, days with state) -> hidden input
     OmniaUI calendar (0.17.0): a month to pick a day or a range from. Rendered on the server; picking, the arrow keys and
     the summary come from /js/oc-calendar.js (npx omniaui copy-js calendar). Props: month ('2026-10', default: of the value
     or today), value ('2026-10-20', single), start / end (range), mode (single|range), min, max, today, name (a hidden input
     with the choice for a form), nav (true: previous / next month as links with ?month=), locale (default app()->getLocale()). --}}
@props(['month' => null, 'value' => null, 'start' => null, 'end' => null, 'mode' => 'single', 'min' => null, 'max' => null, 'today' => null, 'name' => null, 'nav' => true, 'locale' => null])
@php
    $today = $today ?? now()->format('Y-m-d');
    $month = $month ?? substr((string) ($mode === 'range' ? ($start ?? $today) : ($value ?? $today)), 0, 7);
    $first = \Carbon\CarbonImmutable::createFromFormat('Y-m-d', $month.'-01')->setTime(12, 0);
    $locale = $locale ?? app()->getLocale();
    $gridStart = $first->subDays(($first->dayOfWeekIso + 6) % 7);
    $title = $first->locale($locale)->isoFormat('MMMM YYYY');
    $sel = $mode === 'range' ? $start : $value;
    $state = function (string $iso) use ($mode, $value, $start, $end) {
        if ($mode !== 'range') return [$iso === $value, []];
        if (! $start) return [false, []];
        if (! $end || $end === $start) return [$iso === $start, []];
        if ($iso === $start) return [true, ['oc-calendar-day--range-start']];
        if ($iso === $end) return [true, ['oc-calendar-day--range-end']];
        return [false, $iso > $start && $iso < $end ? ['oc-calendar-day--range-middle'] : []];
    };
    $tab = $sel && str_starts_with($sel, $month) ? $sel : (str_starts_with($today, $month) ? $today : $month.'-01');
    $prev = $first->subMonth()->format('Y-m');
    $next = $first->addMonth()->format('Y-m');
@endphp
<div {{ $attributes->class(['oc-calendar'])->merge(['role' => 'group', 'aria-label' => $title, 'data-oc-calendar' => $mode === 'range' ? 'range' : '']) }}>
    <div class="oc-calendar-header">
        @if ($nav)
            <a class="oc-calendar-nav" href="{{ request()->fullUrlWithQuery(['month' => $prev]) }}" aria-label="Previous month"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></a>
        @endif
        <h3 class="oc-calendar-title" aria-live="polite">{{ ucfirst($title) }}</h3>
        @if ($nav)
            <a class="oc-calendar-nav" href="{{ request()->fullUrlWithQuery(['month' => $next]) }}" aria-label="Next month"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a>
        @endif
    </div>
    <table class="oc-calendar-grid" role="grid" aria-label="{{ ucfirst($title) }}">
        <thead><tr>
            @for ($d = 0; $d < 7; $d++)
                @php($wd = $gridStart->addDays($d)->locale($locale))
                <th class="oc-calendar-weekday" scope="col" abbr="{{ $wd->isoFormat('dddd') }}">{{ mb_substr($wd->isoFormat('dd'), 0, 2) }}</th>
            @endfor
        </tr></thead>
        <tbody>
            @for ($w = 0; $w < 6; $w++)
                <tr>
                    @for ($d = 0; $d < 7; $d++)
                        @php($day = $gridStart->addDays($w * 7 + $d))
                        @php($iso = $day->format('Y-m-d'))
                        @php([$selected, $cls] = $state($iso))
                        @php($off = ($min && $iso < $min) || ($max && $iso > $max))
                        <td><button type="button" @class(array_merge(['oc-calendar-day', 'oc-calendar-day--outside' => $day->format('Y-m') !== $month, 'oc-calendar-day--today' => $iso === $today], $cls)) data-date="{{ $iso }}" tabindex="{{ $iso === $tab ? 0 : -1 }}" @if ($selected) aria-selected="true" @endif @if ($iso === $today) aria-current="date" @endif @disabled($off)>{{ $day->day }}</button></td>
                    @endfor
                </tr>
            @endfor
        </tbody>
    </table>
    @if ($name)
        <input type="hidden" name="{{ $name }}" value="{{ $mode === 'range' ? ($start ? $start.'/'.$end : '') : $value }}" data-oc-calendar-value>
    @endif
</div>
