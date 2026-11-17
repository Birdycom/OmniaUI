<?php

// File: tests/V0170Test.php
// Map: dropdown item description + icon tone
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
}
