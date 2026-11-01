{{-- OmniaUI block: form-page - Collapsible form sections in a grid with a sticky action bar. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-formpage: Column wrapper (max 56rem)
       details.oc-collapsible: Section (see Collapsible section)
       .oc-block-formpage-grid: Two-column field grid from 40rem
       .oc-block-formpage-actions: Sticky bottom action bar
     Blade: <x-oc::block.form-page> - attributes merge onto the root element; props: action => #, method => post.
     Blade slots (each falls back to the snippet content when empty): default.
--}}
@props(['action' => '#', 'method' => 'post'])
<form {{ $attributes->merge(['class' => 'oc-block-formpage', 'action' => $action, 'method' => $method]) }}>
    @unless (strtolower($method) === 'get') @csrf @endunless
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <details class="oc-collapsible" open>
    <summary><svg data-icon="mdi:information-outline" class="oc-collapsible-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11 9h2V7h-2m1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m-1 15h2v-6h-2z"/></svg><span class="oc-collapsible-title">General information</span></summary>
    <div class="oc-collapsible-content">
      <div class="oc-block-formpage-grid">
        <div class="oc-field"><label class="oc-field-label" for="oc-form-name">Name</label><input class="oc-input" id="oc-form-name" name="name"></div>
        <div class="oc-field"><label class="oc-field-label" for="oc-form-vat">VAT number</label><input class="oc-input" id="oc-form-vat" name="vat"></div>
        <div class="oc-field"><label class="oc-field-label" for="oc-form-email">E-mail</label><input class="oc-input" id="oc-form-email" name="email" type="email"></div>
        <div class="oc-field"><label class="oc-field-label" for="oc-form-country">Country</label><select class="oc-select" id="oc-form-country" name="country"><option>Belgium</option><option>Netherlands</option></select></div>
      </div>
    </div>
  </details>
  <details class="oc-collapsible">
    <summary><svg data-icon="mdi:format-list-bulleted" class="oc-collapsible-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h14v2H7zm0 8v-2h14v2zM4 4.5A1.5 1.5 0 0 1 5.5 6A1.5 1.5 0 0 1 4 7.5A1.5 1.5 0 0 1 2.5 6A1.5 1.5 0 0 1 4 4.5m0 6A1.5 1.5 0 0 1 5.5 12A1.5 1.5 0 0 1 4 13.5A1.5 1.5 0 0 1 2.5 12A1.5 1.5 0 0 1 4 10.5M7 19v-2h14v2zm-3-2.5A1.5 1.5 0 0 1 5.5 18A1.5 1.5 0 0 1 4 19.5A1.5 1.5 0 0 1 2.5 18A1.5 1.5 0 0 1 4 16.5"/></svg><span class="oc-collapsible-title">Notes</span></summary>
    <div class="oc-collapsible-content"><textarea class="oc-input" name="notes" rows="3" aria-label="Notes"></textarea></div>
  </details>
  <div class="oc-block-formpage-actions">
    <button class="oc-btn oc-btn--outline" type="button">Cancel</button>
    <button class="oc-btn" type="submit">Save</button>
  </div>
    @endif
</form>
