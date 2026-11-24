<?php

// File: tests/V0180MiscTest.php
// Map: card bare -> scroll area bare -> stepper enabled per step -> command item/group -> decimal input integer,
//      allow-negative, rounding -> phone input grouping per dial -> time input slots-popover -> breadcrumb inline SVG
// The non-overlay wishes of 0.18.0 for Blade.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0180MiscTest extends TestCase
{
    public function test_card_bare_adds_the_modifier(): void
    {
        $html = $this->render('<x-oc::card bare><table class="oc-table"></table></x-oc::card>');
        $this->assertElement($html, 'div', 'oc-card oc-card--bare');
        $this->assertStringNotContainsString('oc-card-content', $html);

        $plain = $this->render('<x-oc::card>Body</x-oc::card>');
        $this->assertStringNotContainsString('oc-card--bare', $plain);
    }

    public function test_scroll_area_bare_turns_shadows_off_by_default(): void
    {
        $html = $this->render('<x-oc::scroll-area bare label="Activity">x</x-oc::scroll-area>');
        $this->assertElement($html, 'div', 'oc-scroll-area oc-scroll-area--bare', ['role' => 'region', 'tabindex' => '0']);
        $this->assertStringNotContainsString('oc-scroll-area--shadows', $html);

        $both = $this->render('<x-oc::scroll-area bare :shadows="true">x</x-oc::scroll-area>');
        $this->assertStringContainsString('oc-scroll-area--shadows', $both);

        $plain = $this->render('<x-oc::scroll-area>x</x-oc::scroll-area>');
        $this->assertStringContainsString('oc-scroll-area--shadows', $plain);
    }

    public function test_stepper_enabled_per_step(): void
    {
        $html = $this->render('<x-oc::stepper :current="2" action="goTo" :steps="[\'Company\', \'Invoicing\', [\'label\' => \'Banking\', \'enabled\' => false], [\'label\' => \'Team\', \'enabled\' => true]]" />');
        $this->assertSame(1, substr_count($html, 'disabled'));
        $this->assertSame(1, substr_count($html, 'aria-current="step"'));
        $this->assertStringContainsString('wire:click="goTo(4)"', $html);
        $this->assertStringNotContainsString('wire:click="goTo(3)"', $html);

        $default = $this->render('<x-oc::stepper :current="2" :steps="[\'A\', \'B\', \'C\', \'D\']" />');
        $this->assertSame(2, substr_count($default, 'disabled'));
    }

    public function test_command_item_and_group(): void
    {
        $html = $this->render('<x-oc::command><x-oc::command.group label="Invoices"><x-oc::command.item shortcut="Ctrl N" value="new" selected>New invoice</x-oc::command.item></x-oc::command.group><x-oc::command.group label="Customers" separator><x-oc::command.item disabled>Customer 1</x-oc::command.item></x-oc::command.group></x-oc::command>');
        $this->assertElement($html, 'li', 'oc-command-group-label', ['role' => 'presentation'], 'Invoices');
        $this->assertElement($html, 'li', 'oc-command-item', ['role' => 'option', 'aria-selected' => 'true', 'data-value' => 'new']);
        $this->assertStringContainsString('<span class="oc-command-shortcut">Ctrl N</span>', $html);
        $this->assertElement($html, 'li', 'oc-command-item', ['role' => 'option', 'aria-disabled' => 'true']);
        $this->assertSame(1, substr_count($html, 'oc-command-separator'));
    }

    public function test_decimal_input_integer_negative_and_rounding(): void
    {
        $int = $this->render('<x-oc::decimal-input integer name="qty" :value="12" />');
        $this->assertElement($int, 'input', 'oc-input oc-decimal-input', ['inputmode' => 'numeric', 'value' => '12', 'pattern' => '[0-9.]*']);

        $pos = $this->render('<x-oc::decimal-input :allow-negative="false" name="amount" />');
        $this->assertStringContainsString('pattern="[0-9.]*(,[0-9]{1,2})?"', $pos);

        $neg = $this->render('<x-oc::decimal-input allow-negative name="amount" />');
        $this->assertStringContainsString('pattern="-?[0-9.]*(,[0-9]{1,2})?"', $neg);
        $this->assertStringContainsString('inputmode="decimal"', $neg);

        $a = $this->render('<x-oc::decimal-input name="a" :value="1.005" />');
        $this->assertStringContainsString('value="1,01"', $a);
        $abs = $this->render('<x-oc::decimal-input :allow-negative="false" name="c" :value="-3.5" />');
        $this->assertStringContainsString('value="3,50"', $abs);
        $b = $this->render('<x-oc::decimal-input name="b" :value="2.675" />');
        $this->assertStringContainsString('value="2,68"', $b);
    }

    public function test_phone_input_groups_per_dial(): void
    {
        $be = $this->render('<x-oc::phone-input dial="+32" value="470123456" />');
        $this->assertStringContainsString('value="470 12 34 56"', $be);

        $nl = $this->render('<x-oc::phone-input dial="+31" value="612345678" />');
        $this->assertStringContainsString('value="6 12 34 56 78"', $nl);

        $own = $this->render('<x-oc::phone-input dial="+44" :countries="[\'+44\' => \'UK +44\']" :formats="[\'+44\' => [4, 4]]" value="12345678" />');
        $this->assertStringContainsString('value="1234 5678"', $own);

        $none = $this->render('<x-oc::phone-input />');
        $this->assertMatchesRegularExpression('/<input name="phone" type="tel" inputmode="tel" autocomplete="tel-national" class="oc-phone-input-number">/', $none);
    }

    public function test_time_input_slots_popover(): void
    {
        $html = $this->render('<x-oc::time-input id="meet" name="meeting" value="09:00" slots-popover :slots="[\'09:00\', \'09:30\']" />');
        $this->assertElement($html, 'div', 'oc-time-picker');
        $this->assertElement($html, 'button', 'oc-btn oc-btn--outline oc-btn--icon', ['popovertarget' => 'meet-slots', 'aria-label' => 'Choose a time']);
        $this->assertElement($html, 'div', 'oc-popover', ['id' => 'meet-slots', 'popover' => 'auto']);
        $this->assertSame(2, substr_count($html, 'class="oc-time-slot"'));
        $this->assertMatchesRegularExpression('/value="09:00"\s+checked/', $html);
        $this->assertStringNotContainsString('<datalist', $html);
        $this->assertStringNotContainsString('list="', $html);

        $plain = $this->render('<x-oc::time-input id="t" :slots="[\'09:00\']" />');
        $this->assertStringContainsString('<datalist id="t-slots">', $plain);
    }

    public function test_breadcrumb_ellipsis_and_chevron_are_inline_svg(): void
    {
        $html = $this->render('<x-oc::breadcrumb separator="chevron"><x-oc::breadcrumb.list><x-oc::breadcrumb.item><x-oc::breadcrumb.ellipsis :items="[[\'label\' => \'Customers\', \'href\' => \'/c\']]" /></x-oc::breadcrumb.item><x-oc::breadcrumb.separator /><x-oc::breadcrumb.item><x-oc::breadcrumb.ellipsis /></x-oc::breadcrumb.item></x-oc::breadcrumb.list></x-oc::breadcrumb>');
        $this->assertStringNotContainsString('iconify-icon', $html);
        $this->assertSame(2, substr_count($html, 'data-webicon="mdi:dots-horizontal"'));
        $this->assertSame(1, substr_count($html, 'data-webicon="mdi:chevron-right"'));
    }
}
