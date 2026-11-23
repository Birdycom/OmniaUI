<?php

// File: tests/V0180DeskTest.php
// Map: badge status set + readonly -> breadcrumb max-items + compound parts -> decimal input currency / percent + locale ->
//      barcode fallback -> otp input (the active cell comes from form-extras.js; markup unchanged)

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0180DeskTest extends TestCase
{
    public function test_status_badges(): void
    {
        $paid = $this->render('<x-oc::badge status="paid" />');
        $this->assertElement($paid, 'span', 'oc-badge oc-badge--status', ['data-status' => 'paid'], 'Paid');
        $this->assertStringContainsString('<svg', $paid);

        $own = $this->render('<x-oc::badge status="overdue">Vervallen</x-oc::badge>');
        $this->assertElement($own, 'span', 'oc-badge oc-badge--status', ['data-status' => 'overdue'], 'Vervallen');

        $noIcon = $this->render('<x-oc::badge status="draft" :icon="false" />');
        $this->assertStringNotContainsString('<svg', $noIcon);
        $this->assertStringNotContainsString('iconify', $noIcon);
        $this->assertElement($noIcon, 'span', 'oc-badge oc-badge--status', [], 'Draft');

        $unknown = $this->render('<x-oc::badge status="on-hold">On hold</x-oc::badge>');
        $this->assertElement($unknown, 'span', 'oc-badge oc-badge--status', ['data-status' => 'on-hold'], 'On hold');
        $this->assertStringNotContainsString('<svg', $unknown);

        foreach (['pending', 'sent', 'cancelled', 'approved', 'rejected', 'active', 'inactive', 'archived', 'failed', 'refunded', 'scheduled', 'in-progress', 'done', 'read-only'] as $status) {
            $html = $this->render('<x-oc::badge :status="$s" />', ['s' => $status]);
            $this->assertStringContainsString('data-status="'.$status.'"', $html, $status);
            $this->assertMatchesRegularExpression('/<svg|<iconify-icon/', $html, $status);
        }

        // unchanged: a plain badge
        $this->assertSame('<span class="oc-badge">New</span>', $this->render('<x-oc::badge>New</x-oc::badge>'));
    }

    public function test_readonly_badge(): void
    {
        $html = $this->render('<x-oc::badge variant="readonly" icon="mdi:account-outline" title="Customer 1">Customer 1</x-oc::badge>');
        $this->assertElement($html, 'span', 'oc-badge oc-badge--readonly', ['title' => 'Customer 1']);
        $this->assertStringContainsString('<span>Customer 1</span>', $html);
    }

    public function test_breadcrumb_max_items(): void
    {
        $items = [
            ['label' => 'Dashboard', 'href' => '/'],
            ['label' => 'Relations', 'href' => '/relations'],
            ['label' => 'Customers', 'href' => '/customers'],
            ['label' => 'Company 1', 'href' => '/customers/1'],
            ['label' => 'Projects', 'href' => '/customers/1/projects'],
            ['label' => 'Kitchen'],
        ];
        $html = $this->render('<x-oc::breadcrumb :items="$items" :max-items="4" separator="chevron" />', ['items' => $items]);
        $this->assertElement($html, 'button', 'oc-breadcrumb-ellipsis', ['type' => 'button', 'aria-label' => 'Show 3 more levels']);
        preg_match('/popovertarget="([^"]+)"/', $html, $m);
        $this->assertElement($html, 'div', 'oc-dropdown-menu', ['id' => $m[1], 'popover' => 'auto', 'role' => 'menu']);
        foreach (['Relations', 'Customers', 'Company 1'] as $hidden) {
            $this->assertElement($html, 'a', 'oc-dropdown-item', ['role' => 'menuitem'], $hidden);
        }
        $this->assertElement($html, 'a', 'oc-breadcrumb-item', ['href' => '/'], 'Dashboard');
        $this->assertElement($html, 'a', 'oc-breadcrumb-item', ['href' => '/customers/1/projects'], 'Projects');
        $this->assertElement($html, 'span', 'oc-breadcrumb-item', ['aria-current' => 'page'], 'Kitchen');
        $this->assertSame(1, substr_count($html, 'class="oc-breadcrumb-item">Relations') + substr_count($html, 'role="menuitem" href="/relations"'));

        // a short trail is not folded
        $short = $this->render('<x-oc::breadcrumb :items="$items" :max-items="6" />', ['items' => $items]);
        $this->assertStringNotContainsString('oc-breadcrumb-ellipsis', $short);
    }

    public function test_breadcrumb_compound_parts(): void
    {
        $html = $this->render(<<<'BLADE'
<x-oc::breadcrumb separator="chevron">
    <x-oc::breadcrumb.list>
        <x-oc::breadcrumb.item><x-oc::breadcrumb.link href="/" icon="mdi:home-outline">Dashboard</x-oc::breadcrumb.link></x-oc::breadcrumb.item>
        <x-oc::breadcrumb.separator />
        <x-oc::breadcrumb.item><x-oc::breadcrumb.ellipsis id="bc-more" :items="[['label' => 'Customers', 'href' => '/customers']]" /></x-oc::breadcrumb.item>
        <x-oc::breadcrumb.separator>|</x-oc::breadcrumb.separator>
        <x-oc::breadcrumb.item><x-oc::breadcrumb.page>Kitchen</x-oc::breadcrumb.page></x-oc::breadcrumb.item>
    </x-oc::breadcrumb.list>
</x-oc::breadcrumb>
BLADE);
        $this->assertElement($html, 'nav', 'oc-breadcrumb oc-breadcrumb--chevron', ['aria-label' => 'Breadcrumb']);
        $this->assertStringContainsString('<ol class="oc-breadcrumb-list">', $html);
        $this->assertSame(3, substr_count($html, '<li class="oc-breadcrumb-item"'));
        $this->assertElement($html, 'li', 'oc-breadcrumb-separator', ['role' => 'presentation', 'aria-hidden' => 'true'], '|');
        $this->assertStringContainsString('<svg', $html); // chevron + home icon
        $this->assertElement($html, 'button', 'oc-breadcrumb-ellipsis', ['popovertarget' => 'bc-more', 'aria-label' => 'Show 1 more levels']);
        $this->assertElement($html, 'a', 'oc-breadcrumb-link', ['href' => '/'], 'Dashboard');
        $this->assertElement($html, 'span', 'oc-breadcrumb-page', ['aria-current' => 'page'], 'Kitchen');

        $mark = $this->render('<x-oc::breadcrumb.ellipsis />');
        $this->assertElement($mark, 'span', 'oc-breadcrumb-ellipsis', ['role' => 'img', 'aria-label' => 'More levels']);
    }

    public function test_decimal_input_currency_and_percent(): void
    {
        // unchanged default
        $plain = $this->render('<x-oc::decimal-input name="amount" />');
        $this->assertElement($plain, 'input', 'oc-input oc-decimal-input', ['pattern' => '[0-9.]*(,[0-9]{1,2})?', 'inputmode' => 'decimal']);

        $eur = $this->render('<x-oc::decimal-input name="amount" currency="EUR" :value="1234.5" />');
        $this->assertElement($eur, 'div', 'oc-input-group oc-input-group--affix', ['data-currency' => 'EUR']);
        $this->assertElement($eur, 'span', 'oc-input-addon', ['aria-hidden' => 'true'], '€');
        $this->assertElement($eur, 'input', 'oc-input oc-decimal-input', ['name' => 'amount', 'value' => '1.234,50']);
        $this->assertLessThan(strpos($eur, '<input'), strpos($eur, 'oc-input-addon'));

        $pct = $this->render('<x-oc::decimal-input name="vat" percent :value="21" :decimals="0" />');
        $this->assertElement($pct, 'input', 'oc-input oc-decimal-input', ['value' => '21', 'pattern' => '[0-9.]*']);
        $this->assertGreaterThan(strpos($pct, '<input'), strpos($pct, 'oc-input-addon'));
        $this->assertElement($pct, 'span', 'oc-input-addon', [], '%');

        $en = $this->render('<x-oc::decimal-input name="amount" locale="en-US" currency="USD" :value="1234.5" error />');
        $this->assertElement($en, 'div', 'oc-input-group oc-input-group--affix oc-input-group--error');
        $this->assertElement($en, 'input', 'oc-input oc-decimal-input', ['value' => '1,234.50', 'aria-invalid' => 'true', 'pattern' => '[0-9,]*(\.[0-9]{1,2})?']);

        // a string value (old input) is shown as it is
        $old = $this->render('<x-oc::decimal-input name="amount" currency="EUR" value="12,x" />');
        $this->assertElement($old, 'input', 'oc-input oc-decimal-input', ['value' => '12,x']);
    }

    public function test_barcode_fallback(): void
    {
        $html = $this->render('<x-oc::barcode value="4006381333932" fallback="code128" />');
        $this->assertElement($html, 'figure', 'oc-barcode', ['data-value' => '4006381333932', 'data-fallback' => 'code128']);
        $this->assertStringNotContainsString('data-fallback', $this->render('<x-oc::barcode value="4006381333931" />'));
    }

    public function test_app_header_search_collapse(): void
    {
        $html = $this->render('<x-oc::block.app-header search-collapse><x-slot:search><input class="oc-input" type="search" aria-label="Search"></x-slot:search></x-oc::block.app-header>');
        $this->assertElement($html, 'div', 'oc-block-appbar-search oc-block-appbar-search--collapse');

        $plain = $this->render('<x-oc::block.app-header><x-slot:search><input class="oc-input" type="search" aria-label="Search"></x-slot:search></x-oc::block.app-header>');
        $this->assertElement($plain, 'div', 'oc-block-appbar-search');
    }
}
