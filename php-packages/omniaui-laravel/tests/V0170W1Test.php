<?php

// File: tests/V0170W1Test.php
// Map: drawer -> code window -> date picker -> carousel (numbering, dots, loop) -> resizable -> menubar -> context menu -> search
// Components of 0.17.0 (W1): Blade renders the same classes as the HTML snippets.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170W1Test extends TestCase
{
    public function test_drawer_markup_and_trigger(): void
    {
        $html = $this->render('<x-oc::drawer id="goal" title="Move goal" description="Set your daily activity goal." label="Open drawer">Body<x-slot:footer><button class="oc-btn" type="button" command="close" commandfor="goal">Submit</button></x-slot:footer></x-oc::drawer>');

        $this->assertElement($html, 'button', 'oc-btn oc-btn--outline', ['command' => 'show-modal', 'commandfor' => 'goal'], 'Open drawer');
        $this->assertElement($html, 'dialog', 'oc-drawer', ['id' => 'goal', 'closedby' => 'any', 'aria-labelledby' => 'goal-title']);
        $this->assertElement($html, 'div', 'oc-drawer-handle', ['aria-hidden' => 'true']);
        $this->assertElement($html, 'h2', 'oc-drawer-title', ['id' => 'goal-title'], 'Move goal');
        $this->assertElement($html, 'p', 'oc-drawer-description', [], 'Set your daily activity goal.');
        $this->assertElement($html, 'div', 'oc-drawer-body', [], 'Body');
        $this->assertStringContainsString('<div class="oc-drawer-footer">', $html);

        $center = $this->render('<x-oc::drawer center title="T" />');
        $this->assertElement($center, 'dialog', 'oc-drawer oc-drawer--center');
        $this->assertStringNotContainsString('<button', $center);
        $this->assertStringNotContainsString('oc-drawer-body', $center);
    }

    public function test_code_window(): void
    {
        $html = $this->render('<x-oc::code-window id="sample" title="index.html" code="<button class=&quot;oc-btn&quot;>Hello</button>" />');

        $this->assertElement($html, 'div', 'oc-code-window');
        $this->assertSame(3, substr_count($html, '<i></i>'));
        $this->assertElement($html, 'span', 'oc-code-window__title', [], 'index.html');
        $this->assertElement($html, 'button', 'oc-code-copy', ['data-oc-copy' => '#sample', 'data-copied' => 'Copied'], 'Copy');
        $this->assertElement($html, 'pre', 'oc-code-window__body');
        $this->assertStringContainsString('<code id="sample">&lt;button', $html);
        $this->assertStringContainsString('data-oc-copy', $html);

        $dark = $this->render('<x-oc::code-window dark :copy="false"><div class="oc-code-block">x</div></x-oc::code-window>');
        $this->assertElement($dark, 'div', 'oc-code-window oc-code-window--dark');
        $this->assertElement($dark, 'div', 'oc-code-block', [], 'x');
        $this->assertStringNotContainsString('oc-code-copy', $dark);
    }

    public function test_date_picker(): void
    {
        $html = $this->render('<x-oc::date-picker id="when" value="2026-10-16" today="2026-10-14" locale="en" name="when" />');

        $this->assertElement($html, 'button', 'oc-btn oc-btn--outline oc-date-picker-trigger', ['id' => 'when', 'type' => 'button', 'popovertarget' => 'when-calendar', 'aria-haspopup' => 'dialog']);
        $this->assertStringContainsString('<span>16 October 2026</span>', $html);
        $this->assertDoesNotMatchRegularExpression('/<button[^>]*data-empty/', $html);
        $this->assertElement($html, 'div', 'oc-popover oc-popover--calendar', ['id' => 'when-calendar', 'popover' => null]);
        $this->assertElement($html, 'div', 'oc-calendar');
        $this->assertElement($html, 'button', 'oc-calendar-day', ['data-date' => '2026-10-16', 'aria-selected' => 'true']);
        $this->assertStringContainsString('name="when" value="2026-10-16"', $html);

        $empty = $this->render('<x-oc::date-picker />');
        $this->assertMatchesRegularExpression('/<button[^>]*data-empty/', $empty);
        $this->assertStringContainsString('<span>Pick a date</span>', $empty);
    }

    public function test_carousel_numbers_slides_and_dots(): void
    {
        $html = $this->render('<x-oc::carousel id="hl" label="Highlights" per="halves"><x-oc::carousel.item id="s1">Slide 1</x-oc::carousel.item><x-oc::carousel.item id="s2">Slide 2</x-oc::carousel.item><x-oc::carousel.item id="s3" aria-label="Last">Slide 3</x-oc::carousel.item></x-oc::carousel>');

        $this->assertElement($html, 'div', 'oc-carousel oc-carousel--halves', ['id' => 'hl']);
        $this->assertElement($html, 'div', 'oc-carousel-viewport', ['id' => 'hl-viewport', 'tabindex' => '0', 'role' => 'region', 'aria-roledescription' => 'carousel', 'aria-label' => 'Highlights']);
        $this->assertElement($html, 'div', 'oc-carousel-item', ['id' => 's1', 'role' => 'group', 'aria-roledescription' => 'slide', 'aria-label' => '1 of 3'], 'Slide 1');
        $this->assertElement($html, 'div', 'oc-carousel-item', ['id' => 's2', 'aria-label' => '2 of 3']);
        $this->assertElement($html, 'div', 'oc-carousel-item', ['id' => 's3', 'aria-label' => 'Last']);
        $this->assertStringNotContainsString('data-oc-slide', $html);
        $this->assertElement($html, 'nav', 'oc-carousel-dots', ['aria-label' => 'Choose a slide']);
        $this->assertElement($html, 'a', 'oc-carousel-dot', ['href' => '#s3', 'aria-label' => 'Slide 3']);
        $this->assertStringNotContainsString('oc-carousel-prev', $html);
    }

    public function test_carousel_loop(): void
    {
        $html = $this->render('<x-oc::carousel loop :dots="false"><x-oc::carousel.item>A</x-oc::carousel.item><x-oc::carousel.item>B</x-oc::carousel.item></x-oc::carousel>');

        $this->assertElement($html, 'div', 'oc-carousel oc-carousel--loop');
        $this->assertElement($html, 'button', 'oc-carousel-prev', ['aria-label' => 'Previous slide', 'aria-controls' => null]);
        $this->assertElement($html, 'button', 'oc-carousel-next', ['aria-label' => 'Next slide']);
        $this->assertStringNotContainsString('oc-carousel-dots', $html);
        $this->assertSame(2, substr_count($html, 'aria-roledescription="slide"'));
    }

    public function test_resizable(): void
    {
        $html = $this->render('<x-oc::resizable vertical style="block-size:14rem"><x-oc::resizable.panel resizable>Editor</x-oc::resizable.panel><x-oc::resizable.panel>Preview</x-oc::resizable.panel></x-oc::resizable>');
        $this->assertElement($html, 'div', 'oc-resizable oc-resizable--vertical', ['style' => null]);
        $this->assertElement($html, 'div', 'oc-resizable-panel oc-resizable-panel--resizable', [], 'Editor');
        $this->assertElement($html, 'div', 'oc-resizable-panel', [], 'Preview');
        $this->assertElement($this->render('<x-oc::resizable box />'), 'div', 'oc-resizable-box oc-resizable');
    }

    public function test_menubar(): void
    {
        $menus = [
            ['label' => 'File', 'id' => 'mb-file', 'items' => [['label' => 'New tab', 'shortcut' => 'Ctrl T'], ['separator' => true], ['label' => 'Share', 'items' => [['label' => 'E-mail link']]]]],
            ['label' => 'View', 'id' => 'mb-view', 'items' => [['label' => 'Always show bookmarks', 'checked' => true], ['label' => 'Delete', 'destructive' => true]]],
        ];
        $html = $this->render('<x-oc::menubar label="Application" :menus="$menus" />', ['menus' => $menus]);

        $this->assertElement($html, 'div', 'oc-menubar', ['role' => 'menubar', 'aria-label' => 'Application']);
        $this->assertElement($html, 'button', 'oc-menubar-trigger', ['role' => 'menuitem', 'popovertarget' => 'mb-file', 'aria-haspopup' => 'menu'], 'File');
        $this->assertElement($html, 'div', 'oc-dropdown-menu', ['id' => 'mb-view', 'popover' => null, 'role' => 'menu']);
        $this->assertElement($html, 'span', 'oc-dropdown-shortcut', [], 'Ctrl T');
        $this->assertElement($html, 'div', 'oc-dropdown-separator', ['role' => 'separator']);
        $this->assertElement($html, 'div', 'oc-dropdown-submenu', ['role' => 'menu']);
        $this->assertElement($html, 'button', 'oc-dropdown-item', ['role' => 'menuitem', 'aria-haspopup' => 'menu'], 'Share');
        $this->assertElement($html, 'button', 'oc-dropdown-item', ['role' => 'menuitemcheckbox', 'aria-checked' => 'true'], 'Always show bookmarks');
        $this->assertElement($html, 'button', 'oc-dropdown-item oc-dropdown-item--destructive', ['role' => 'menuitem'], 'Delete');
    }

    public function test_context_menu(): void
    {
        $html = $this->render('<x-oc::context-menu id="ctx" :items="[[\'label\' => \'Reload\', \'shortcut\' => \'Ctrl R\']]">Right-click here</x-oc::context-menu>');

        $this->assertElement($html, 'div', 'oc-context-area', ['tabindex' => '0', 'data-oc-context-menu' => 'ctx'], 'Right-click here');
        $this->assertElement($html, 'div', 'oc-dropdown-menu oc-context-menu', ['id' => 'ctx', 'popover' => null, 'role' => 'menu', 'aria-label' => 'Actions']);
        $this->assertElement($html, 'span', 'oc-dropdown-shortcut', [], 'Ctrl R');
        $this->assertStringContainsString('addEventListener("contextmenu"', $html);
    }

    public function test_search(): void
    {
        $html = $this->render('<x-oc::search class="extra" placeholder="Search the docs" hint="/" autofocus />');

        $this->assertElement($html, 'label', 'oc-search extra');
        $this->assertElement($html, 'svg', 'oc-search-icon', ['aria-hidden' => 'true']);
        $this->assertElement($html, 'input', 'oc-search-input', ['type' => 'search', 'name' => 'q', 'placeholder' => 'Search the docs', 'aria-label' => 'Search the docs', 'autofocus' => null]);
        $this->assertElement($html, 'kbd', 'oc-search-hint', [], '/');
    }
}
