<?php

// File: tests/V0180ReviewTest.php
// Map: phone input carries its own formats for oc-form-extras.js (regroup on a country change) -> time input
//      select-on-focus (default on with slots-popover)

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0180ReviewTest extends TestCase
{
    public function test_phone_input_passes_its_own_formats_to_the_script(): void
    {
        $own = $this->render('<x-oc::phone-input dial="+44" :countries="[\'+44\' => \'UK +44\', \'+32\' => \'BE +32\']" :formats="[\'+44\' => [4, 4]]" value="12345678" />');
        $this->assertStringContainsString('data-oc-formats="{&quot;+44&quot;:[4,4]}"', $own);
        $this->assertStringContainsString('value="1234 5678"', $own);

        // without formats of your own the script uses its defaults: no attribute
        $plain = $this->render('<x-oc::phone-input dial="+32" value="470123456" />');
        $this->assertStringNotContainsString('data-oc-formats', $plain);
        $this->assertStringContainsString('value="470 12 34 56"', $plain);
    }

    public function test_time_input_select_on_focus(): void
    {
        $popover = $this->render('<x-oc::time-input id="meet" value="09:00" slots-popover :slots="[\'09:00\']" />');
        $this->assertMatchesRegularExpression('/<input(?=[^>]*data-oc-select-on-focus)[^>]*class="oc-input oc-time-input"/', $popover);

        $off = $this->render('<x-oc::time-input id="meet2" value="09:00" slots-popover :select-on-focus="false" :slots="[\'09:00\']" />');
        $this->assertStringNotContainsString('data-oc-select-on-focus', $off);

        $plain = $this->render('<x-oc::time-input id="t" />');
        $this->assertStringNotContainsString('data-oc-select-on-focus', $plain);

        $on = $this->render('<x-oc::time-input id="t2" select-on-focus />');
        $this->assertStringContainsString('data-oc-select-on-focus', $on);
    }
}
