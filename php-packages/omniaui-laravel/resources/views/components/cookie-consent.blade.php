{{-- File: resources/views/components/cookie-consent.blade.php | Map: props -> reopen button -> popover (title, text, categories, actions) -> one-time script
     OmniaUI cookie banner on popover="manual". Props: id, categories (array of ['name' => …, 'label' => …, 'text' => ?,
     'required' => ?]), title, policyHref, customizeLabel, necessaryLabel, selectedLabel, allLabel, openLabel (empty string hides the
     "Cookie settings" button), bar, manual. Slot: default replaces the text. The script shows the banner when no choice is
     stored, saves { necessary, <categories>, date } in localStorage under "oc-consent" and fires "oc-consent" on document. --}}
@props([
    'id' => 'oc-cookie-consent',
    'categories' => [
        ['name' => 'necessary', 'label' => 'Necessary', 'text' => 'Session, security and your cookie choice. Always on.', 'required' => true],
        ['name' => 'statistics', 'label' => 'Statistics', 'text' => 'Anonymous visit counts.'],
        ['name' => 'marketing', 'label' => 'Marketing', 'text' => 'Embedded videos and ads that track you.'],
    ],
    'title' => 'We use cookies',
    'policyHref' => '#cookie-policy',
    'customizeLabel' => 'Customize',
    'necessaryLabel' => 'Only necessary',
    'selectedLabel' => 'Save choice',
    'allLabel' => 'Accept all',
    'openLabel' => 'Cookie settings',
    'bar' => false,
    'manual' => false,
])
@if ($openLabel)
    <button type="button" class="oc-btn oc-btn--outline oc-btn--sm" data-oc-consent-open>{{ $openLabel }}</button>
@endif
<aside {{ $attributes->class(['oc-cookie-consent', 'oc-cookie-consent--bar' => $bar])->merge(['id' => $id, 'popover' => 'manual', 'aria-labelledby' => $id.'-title', 'data-oc-consent-manual' => $manual ? '' : null]) }}>
    <h2 class="oc-cookie-consent__title" id="{{ $id }}-title"><span aria-hidden="true">&#127850;</span> {{ $title }}</h2>
    <p class="oc-cookie-consent__text">
        @if ($slot->isEmpty())
            Necessary cookies keep the site working. With your permission we also measure visits to improve the site. Read the <a href="{{ $policyHref }}">cookie policy</a>.
        @else
            {{ $slot }}
        @endif
    </p>
    <details class="oc-cookie-consent__prefs">
        <summary>{{ $customizeLabel }}</summary>
        @foreach ($categories as $c)
            <div class="oc-cookie-consent__category">
                <span class="oc-cookie-consent__category-name">{{ $c['label'] }}</span>
                @if (! empty($c['text']))
                    <span class="oc-cookie-consent__category-text">{{ $c['text'] }}</span>
                @endif
                <label class="oc-switch"><input type="checkbox" role="switch" name="{{ $c['name'] }}" @checked($c['required'] ?? false) @disabled($c['required'] ?? false) aria-label="{{ $c['label'] }} cookies"><span class="oc-switch-track"></span></label>
            </div>
        @endforeach
    </details>
    <div class="oc-cookie-consent__actions">
        <button type="button" class="oc-btn oc-btn--outline" data-oc-consent="necessary">{{ $necessaryLabel }}</button>
        <button type="button" class="oc-btn oc-btn--secondary" data-oc-consent="selected">{{ $selectedLabel }}</button>
        <button type="button" class="oc-btn" data-oc-consent="all">{{ $allLabel }}</button>
    </div>
</aside>
@once
    <script>
        // Cookie consent: show when no choice is stored, save the choice, tell the page (event "oc-consent").
        (() => {
            const box = document.querySelector(".oc-cookie-consent[popover]");
            if (!box) return;
            const KEY = "oc-consent";
            const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
            const inputs = () => [...box.querySelectorAll("input[name]")];
            const apply = (choice) => { for (const i of inputs()) if (!i.disabled) i.checked = !!choice?.[i.name]; };
            const stored = read();
            if (stored) document.dispatchEvent(new CustomEvent("oc-consent", { detail: stored }));
            else if (!box.hasAttribute("data-oc-consent-manual")) box.showPopover();
            box.addEventListener("click", (e) => {
                const mode = e.target.closest("[data-oc-consent]")?.dataset.ocConsent;
                if (!mode) return;
                const choice = { necessary: true, date: new Date().toISOString() };
                for (const i of inputs()) if (!i.disabled) choice[i.name] = mode === "all" || (mode === "selected" && i.checked);
                try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch {}
                box.hidePopover();
                document.dispatchEvent(new CustomEvent("oc-consent", { detail: choice }));
            });
            document.addEventListener("click", (e) => {
                if (!e.target.closest("[data-oc-consent-open]")) return;
                apply(read());
                box.showPopover();
            });
        })();
    </script>
@endonce
