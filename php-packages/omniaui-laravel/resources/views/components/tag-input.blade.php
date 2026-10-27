{{-- OmniaCSS tag input. Props: tags (list of strings), name (form field, submitted as name[]), placeholder, suggestions (list of strings), label.
     A few lines of inline JavaScript add, remove and suggest tags. For a Livewire-bound version see birdycom/omniaui-livewire (<x-oc::wire.tag-input>). --}}
@props(['tags' => [], 'name' => 'tags', 'placeholder' => 'Add tag...', 'suggestions' => [], 'label' => 'Add tag'])
<div {{ $attributes->class(['oc-tag-input'])->merge(['data-oc-tags' => $name]) }}>
    @foreach ($tags as $tag)
        <span class="oc-tag">{{ $tag }} <button class="oc-tag-remove" type="button" aria-label="Remove {{ $tag }}">&times;</button><input type="hidden" name="{{ $name }}[]" value="{{ $tag }}"></span>
    @endforeach
    <input type="text" placeholder="{{ $placeholder }}" aria-label="{{ $label }}">
</div>
@if (count($suggestions))
    <div class="oc-tag-suggestions" data-oc-tags-for="{{ $name }}">
        @foreach ($suggestions as $suggestion)
            <button type="button">{{ $suggestion }}</button>
        @endforeach
    </div>
@endif
@once
    <script>
        (() => {
            const add = (box, value) => {
                value = value.trim();
                if (!value) return;
                const name = box.dataset.ocTags;
                const exists = Array.from(box.querySelectorAll('input[type=hidden]')).some((i) => i.value === value);
                if (exists) return;
                const chip = document.createElement('span');
                chip.className = 'oc-tag';
                chip.append(value + ' ');
                const remove = document.createElement('button');
                remove.className = 'oc-tag-remove';
                remove.type = 'button';
                remove.setAttribute('aria-label', 'Remove ' + value);
                remove.innerHTML = '&times;';
                const hidden = document.createElement('input');
                hidden.type = 'hidden';
                hidden.name = name + '[]';
                hidden.value = value;
                chip.append(remove, hidden);
                box.insertBefore(chip, box.querySelector('input[type=text]'));
            };
            document.addEventListener('click', (e) => {
                const remove = e.target.closest('.oc-tag-remove');
                if (remove && remove.closest('[data-oc-tags]')) { remove.closest('.oc-tag').remove(); return; }
                const suggestion = e.target.closest('[data-oc-tags-for] button');
                if (suggestion) {
                    const box = document.querySelector('[data-oc-tags="' + suggestion.parentElement.dataset.ocTagsFor + '"]');
                    if (box) add(box, suggestion.textContent);
                }
            });
            document.addEventListener('keydown', (e) => {
                const box = e.target.closest && e.target.closest('[data-oc-tags]');
                if (!box || e.target.type !== 'text') return;
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(box, e.target.value); e.target.value = ''; }
                else if (e.key === 'Backspace' && !e.target.value) { const last = box.querySelector('.oc-tag:last-of-type'); if (last) last.remove(); }
            });
        })();
    </script>
@endonce
