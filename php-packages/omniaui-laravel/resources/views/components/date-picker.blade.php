{{-- File: resources/views/components/date-picker.blade.php | Map: props -> trigger (.oc-date-picker-trigger, value or placeholder) -> popover (.oc-popover--calendar) with <x-oc::calendar> -> label script (once)
     OmniaUI date picker (0.17.0): a trigger button with a calendar in a popover (same markup as
     packages/ui/snippets/date-picker.html). Picking needs /js/oc-calendar.js (npx omniaui copy-js calendar); the small
     script below then writes the date on the trigger and closes the popover. Props: value ('2026-10-16'), placeholder
     ("Pick a date"), name (hidden input for a form), min, max, today, locale (default app()->getLocale()), nav (month
     links in the calendar, default true), id. Attributes go to the trigger button. --}}
@props(['value' => null, 'placeholder' => 'Pick a date', 'name' => null, 'min' => null, 'max' => null, 'today' => null, 'locale' => null, 'nav' => true, 'id' => null])
@php
    $locale = $locale ?? app()->getLocale();
    $popId = $id ? $id.'-calendar' : 'oc-date-picker-'.substr(md5(uniqid('', true)), 0, 6);
    $text = $value ? \Carbon\CarbonImmutable::createFromFormat('Y-m-d', $value)->locale($locale)->isoFormat('D MMMM YYYY') : $placeholder;
@endphp
<button {{ $attributes->class(['oc-btn', 'oc-btn--outline', 'oc-date-picker-trigger'])->merge(['id' => $id, 'type' => 'button', 'popovertarget' => $popId, 'aria-haspopup' => 'dialog']) }} @if (! $value) data-empty @endif>
    <span>{{ $text }}</span> <x-oc::webicon name="mdi:calendar" size="sm" />
</button>
<div class="oc-popover oc-popover--calendar" id="{{ $popId }}" popover>
    <x-oc::calendar :value="$value" :name="$name" :min="$min" :max="$max" :today="$today" :locale="$locale" :nav="$nav" />
</div>
@once
    <script>
        // Date picker: a day picked in the calendar (oc-calendar.js) goes on the trigger, and the popover closes.
        document.addEventListener("oc-calendar-change", (e) => {
            const pop = e.target.closest(".oc-popover--calendar[id]");
            const date = e.detail && e.detail.date;
            if (!pop || !date) return;
            const trigger = document.querySelector('.oc-date-picker-trigger[popovertarget="' + pop.id + '"]');
            const label = trigger && trigger.querySelector("span");
            if (label) {
                const lang = trigger.closest("[lang]")?.getAttribute("lang") || undefined;
                label.textContent = new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" }).format(new Date(date + "T12:00:00"));
                trigger.removeAttribute("data-empty");
            }
            try { pop.hidePopover(); } catch { /* already closed */ }
            if (trigger) trigger.focus();
        });
    </script>
@endonce
