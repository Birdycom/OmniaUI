<?php

// File: tests/V0170D2Test.php
// Map: combobox catalog mode (search event/url, delay, clear row, custom row, manage footer, portal, description/image/
//      emoji, selected, ledger + module) -> form field extras (tooltip, rich tooltip, required, label-trailing, error-key,
//      hide-label, ledger, module) -> input mask/validation data attributes -> select/textarea/input-group ledger + module

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

use Illuminate\Support\MessageBag;
use Illuminate\Support\ViewErrorBag;

class V0170D2Test extends TestCase
{
    public function test_combobox_without_new_props_keeps_its_markup(): void
    {
        $html = $this->render('<x-oc::combobox id="c" :options="[\'a\' => \'Apple\']" />');
        $this->assertStringContainsString('<ul class="oc-combobox-list" id="c" role="listbox" aria-label="Choose">', $html);
        $this->assertStringNotContainsString('oc-combobox-clear', $html);
        $this->assertStringNotContainsString('oc-combobox-footer', $html);
        $this->assertStringNotContainsString('data-oc-portal', $html);
        $this->assertStringNotContainsString('data-module', $html);
    }

    public function test_combobox_server_search_attributes(): void
    {
        $event = $this->render('<x-oc::combobox search="event" search-delay="300" :options="[]" label="Customer" />');
        $this->assertStringContainsString('data-oc-search="event"', $event);
        $this->assertStringContainsString('data-oc-search-delay="300"', $event);

        $url = $this->render('<x-oc::combobox search-url="/customers/search?q=" value-type="number" :options="[]" />');
        $this->assertStringContainsString('data-oc-search-url="/customers/search?q="', $url);
        $this->assertStringContainsString('data-oc-value-type="number"', $url);
    }

    public function test_combobox_catalog_rows_and_footer(): void
    {
        $html = $this->render(
            '<x-oc::combobox id="cust" name="customer" value="1" clear-label="No customer" allow-custom-from-search :custom-label="$customLabel" manage-href="/customers" manage-label="Manage customers" portal variant="ledger" module="green" :options="$options" />',
            ['customLabel' => 'Add "{query}"', 'options' => [
                1 => ['label' => 'Company 1', 'description' => 'info@company1.example', 'emoji' => 'E'],
                2 => ['label' => 'Customer 1', 'image' => '/img/customer-1.png'],
                3 => ['label' => 'Customer 2', 'icon' => 'mdi:account'],
            ]],
        );
        $this->assertElement($html, 'div', 'oc-combobox oc-combobox--ledger', ['data-module' => 'green', 'data-oc-portal' => '']);
        $this->assertStringContainsString('oc-input oc-combobox-input oc-input--ledger', $html);
        // Panel: listbox + footer with the link outside the listbox.
        $this->assertStringContainsString('<div class="oc-combobox-list oc-combobox-list--panel">', $html);
        $this->assertStringContainsString('<ul class="oc-combobox-options" id="cust" role="listbox"', $html);
        $this->assertMatchesRegularExpression('#</ul>\s*<div class="oc-combobox-footer"><a href="/customers" tabindex="-1">Manage customers</a></div>#', $html);
        // Clear row first, custom row hidden at the end.
        $this->assertMatchesRegularExpression('#role="listbox"[^>]*>\s*<li class="oc-combobox-option oc-combobox-clear" role="option" tabindex="-1" data-value=""#', $html);
        $this->assertStringContainsString('class="oc-combobox-option oc-combobox-custom"', $html);
        $this->assertStringContainsString('data-oc-custom-label="Add &quot;{query}&quot;"', $html);
        // Description, image, emoji, icon; the chosen emoji in the field.
        $this->assertStringContainsString('<span class="oc-combobox-option-text"><span class="oc-combobox-option-label">Company 1</span><span class="oc-combobox-option-description">info@company1.example</span></span>', $html);
        $this->assertStringContainsString('<img class="oc-combobox-option-image" src="/img/customer-1.png" alt="">', $html);
        $this->assertMatchesRegularExpression('#<span class="oc-combobox-icon" aria-hidden="true"><span class="oc-combobox-option-emoji" aria-hidden="true">E</span></span>#', $html);
        $this->assertStringContainsString('value="Company 1"', $html);
    }

    public function test_combobox_selected_outside_the_options(): void
    {
        $html = $this->render('<x-oc::combobox search="event" value="42" :selected="[\'value\' => 42, \'label\' => \'Company 42\']" :options="[]" />');
        $this->assertStringContainsString('value="Company 42"', $html);
    }

    public function test_form_field_extras(): void
    {
        $html = $this->render('<x-oc::form-field label="IBAN" for="iban" tooltip="The account the refund goes to" required label-trailing="Optional help"><input id="iban"></x-oc::form-field>');
        $this->assertStringContainsString('<div class="oc-field-label-row">', $html);
        $this->assertMatchesRegularExpression('#<label class="oc-field-label" for="iban"\s*>IBAN<span class="oc-field-required" aria-hidden="true">\*</span></label>#', $html);
        $this->assertStringContainsString('data-tooltip="The account the refund goes to"', $html);
        $this->assertStringContainsString('<button type="button" class="oc-field-tooltip" aria-label="More information" aria-describedby="iban-tip">', $html);
        $this->assertStringContainsString('<span class="oc-visually-hidden" id="iban-tip">The account the refund goes to</span>', $html);
        $this->assertStringContainsString('mdi:information-outline', $html);
        $this->assertStringContainsString('<span class="oc-field-label-trailing">Optional help</span>', $html);

        $rich = $this->render('<x-oc::form-field label="VAT" for="vat"><x-slot:tooltip><strong>BE0123.456.749</strong></x-slot:tooltip><input id="vat"></x-oc::form-field>');
        $this->assertStringContainsString('<span class="oc-tooltip__content" role="tooltip" id="vat-tip"><strong>BE0123.456.749</strong></span>', $rich);
        $this->assertStringNotContainsString('data-tooltip', $rich);

        $plain = $this->render('<x-oc::form-field label="Name" for="n"><input id="n"></x-oc::form-field>');
        $this->assertStringNotContainsString('oc-field-label-row', $plain);
        $this->assertStringNotContainsString('data-error-key', $plain);
    }

    public function test_form_field_error_key_hide_label_ledger_module(): void
    {
        view()->share('errors', (new ViewErrorBag)->put('default', new MessageBag(['email' => 'Fill in a valid e-mail address.'])));
        $html = $this->render('<x-oc::form-field label="Email" error-key="email" hide-label variant="ledger" module="gold"><input></x-oc::form-field>');
        view()->share('errors', new ViewErrorBag);
        $this->assertElement($html, 'div', 'oc-field oc-field--ledger', ['data-module' => 'gold', 'data-error-key' => 'email']);
        $this->assertMatchesRegularExpression('#<label class="oc-field-label oc-visually-hidden"\s*>Email</label>#', $html);
        $this->assertMatchesRegularExpression('#<p class="oc-field-error" role="alert" id="email-error"\s*>Fill in a valid e-mail address\.</p>#', $html);
    }

    public function test_input_mask_and_validation(): void
    {
        $html = $this->render('<x-oc::input name="iban" mask="iban" validation-type="iban" validation-message="Not a valid IBAN" variant="ledger" module="blue" />');
        $this->assertElement($html, 'input', 'oc-input oc-input--ledger', [
            'name' => 'iban', 'data-oc-mask' => 'iban', 'data-oc-validate' => 'iban', 'data-oc-validation-message' => 'Not a valid IBAN', 'data-module' => 'blue',
        ]);
        $plain = $this->render('<x-oc::input name="x" />');
        $this->assertStringNotContainsString('data-oc-', $plain);
        $this->assertStringNotContainsString('data-module', $plain);
    }

    public function test_select_textarea_input_group_ledger_and_module(): void
    {
        $select = $this->render('<x-oc::select name="s" variant="ledger" module="blue" :options="[\'a\' => \'A\']" />');
        $this->assertElement($select, 'select', 'oc-select oc-select--ledger', ['data-module' => 'blue']);

        $textarea = $this->render('<x-oc::textarea name="t" variant="ledger" module="blue" />');
        $this->assertElement($textarea, 'textarea', 'oc-input oc-textarea--ledger', ['data-module' => 'blue']);

        $group = $this->render('<x-oc::input-group prefix="EUR" variant="ledger" module="blue" name="amount" />');
        $this->assertMatchesRegularExpression('#<div class="oc-input-group oc-input-group--ledger" data-module="blue"\s*>#', $group);
        $this->assertStringContainsString('class="oc-input oc-input--ledger"', $group);
    }
}
