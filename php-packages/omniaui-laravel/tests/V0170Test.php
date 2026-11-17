<?php

// File: tests/V0170Test.php
// Map: dropdown item description + icon tone -> sidebar meta wrap/collapsed -> form section invalid + count -> otp fit/group
// Components and options of 0.17.0: Blade renders the same classes as the HTML snippets.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170Test extends TestCase
{
    public function test_dropdown_item_description_and_tone(): void
    {
        $html = $this->render('<x-oc::dropdown label="New stop" :items="[[\'label\' => \'Checkpoint\', \'href\' => \'/new/checkpoint\', \'icon\' => \'mdi:check\', \'tone\' => \'success\', \'description\' => \'Players scan a code here\'], [\'label\' => \'Plain\', \'href\' => \'/p\']]" />');

        $this->assertElement($html, 'span', 'oc-dropdown-icon oc-dropdown-icon--success', ['aria-hidden' => 'true']);
        $this->assertStringContainsString('data-webicon="mdi:check"', $html);
        $this->assertElement($html, 'span', 'oc-dropdown-desc', [], 'Players scan a code here');
        $this->assertSame(1, substr_count($html, 'oc-dropdown-text'));
    }

    public function test_sidebar_meta_wrap_and_collapsed(): void
    {
        $html = $this->render('<x-oc::sidebar.meta wrap brand="App 1" version="2.4.0" copyright="© 2026 Company 1" />');
        $this->assertElement($html, 'div', 'oc-sidebar-meta oc-tooltip oc-tooltip--right oc-sidebar-meta--wrap');
        $collapsed = $this->render('<x-oc::sidebar.meta collapsed version="2.4.0" />');
        $this->assertElement($collapsed, 'div', 'oc-sidebar-meta oc-tooltip oc-tooltip--right oc-sidebar-meta--collapsed');
    }

    public function test_form_section_invalid_and_count(): void
    {
        $html = $this->render('<x-oc::form-section title="Location" invalid="error" :issues="2" icon="mdi:map-marker-outline">Fields</x-oc::form-section>');
        $this->assertElement($html, 'details', 'oc-form-section', ['data-issue' => 'error']);
        $this->assertElement($html, 'span', 'oc-form-section__count', ['aria-label' => '2 errors'], '2');
        $plain = $this->render('<x-oc::form-section title="Name" :issues="2">Fields</x-oc::form-section>');
        $this->assertStringNotContainsString('data-issue', $plain);
        $this->assertStringNotContainsString('oc-form-section__count', $plain);
    }

    public function test_otp_fit_and_group(): void
    {
        $html = $this->render('<x-oc::otp-input :length="8" fit :group="4" alphanumeric />');
        $this->assertElement($html, 'input', 'oc-otp oc-otp--fit oc-otp--group', ['maxlength' => '8', 'inputmode' => 'text', 'style' => '--oc-otp-length: 8; --oc-otp-group: 4']);
        $this->assertStringNotContainsString('pattern=', $html);
    }
}
