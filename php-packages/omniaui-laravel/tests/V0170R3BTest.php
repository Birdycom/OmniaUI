<?php

// File: tests/V0170R3BTest.php
// Map: 0.17.0 round 3 B: docs sidebar -> section block / header + version badge -> icon list extras -> shot lightbox
//      -> avatar picker wire:model on the input -> browser frame body -> checklist check variant

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170R3BTest extends TestCase
{
    public function test_docs_sidebar_drops_the_wrappers(): void
    {
        $html = $this->render('<x-oc::sidebar variant="docs" title="Docs" label="Docs"><x-oc::sidebar.group label="Layout"><x-oc::sidebar.item href="/flexbox" active>Flexbox<x-slot:sub><x-oc::sidebar.item href="/gap" current>Gap</x-oc::sidebar.item></x-slot:sub></x-oc::sidebar.item></x-oc::sidebar.group></x-oc::sidebar>');

        $this->assertElement($html, 'nav', 'oc-sidebar oc-sidebar--docs', ['aria-label' => 'Docs']);
        $this->assertElement($html, 'h2', 'oc-sidebar-title', [], 'Docs');
        $this->assertElement($html, 'p', 'oc-sidebar-group-label', [], 'Layout');
        $this->assertElement($html, 'a', 'oc-sidebar-menu-button is-active', ['href' => '/flexbox']);
        $this->assertElement($html, 'a', 'oc-sidebar-menu-button', ['href' => '/gap', 'aria-current' => 'page'], 'Gap');
        $this->assertElement($html, 'ul', 'oc-sidebar-menu-sub');
        $this->assertStringNotContainsString('oc-sidebar-content', $html);
        $this->assertStringNotContainsString('oc-sidebar-group"', $html);
        $this->assertStringNotContainsString('oc-sidebar-menu-label', $html);
        $this->assertStringNotContainsString('data-tooltip', $html);
        $this->assertStringNotContainsString('<details', $html);
    }

    public function test_app_sidebar_stays_the_same(): void
    {
        $html = $this->render('<x-oc::sidebar><x-oc::sidebar.group label="Platform"><x-oc::sidebar.item href="/">Home</x-oc::sidebar.item></x-oc::sidebar.group></x-oc::sidebar>');

        $this->assertElement($html, 'aside', 'oc-sidebar', ['aria-label' => 'Main navigation']);
        $this->assertElement($html, 'div', 'oc-sidebar-group-label', [], 'Platform');
        $this->assertElement($html, 'a', 'oc-sidebar-menu-button oc-tooltip oc-tooltip--right', ['data-tooltip' => 'Home']);
        $this->assertStringNotContainsString('title=', $html);
    }

    public function test_section_block_with_all_parts(): void
    {
        $html = $this->render('<x-oc::section-block title="Notifications" source="Settings" version="v1.2" description="Choose." footer-title="More?" footer-description="Per project."><p>Body</p></x-oc::section-block>');

        $this->assertElement($html, 'section', 'oc-section');
        $this->assertElement($html, 'h2', 'oc-section-header__title', [], 'Notifications');
        $this->assertElement($html, 'span', 'oc-badge-source oc-section-header__badge-source', [], 'Settings');
        $this->assertElement($html, 'span', 'oc-badge-version oc-section-header__badge-version', [], 'v1.2');
        $this->assertElement($html, 'p', 'oc-section-header__desc', [], 'Choose.');
        $this->assertElement($html, 'div', 'oc-section-content', [], 'Body');
        $this->assertElement($html, 'h3', 'oc-section-footer__title', [], 'More?');
        $this->assertElement($html, 'p', 'oc-section-footer__desc', [], 'Per project.');
    }

    public function test_section_block_leaves_out_empty_parts(): void
    {
        $html = $this->render('<x-oc::section-block docs title="Title only" />');

        $this->assertSame('<section class="oc-docs-section"> <div class="oc-section-header"> <h2 class="oc-section-header__title">Title only</h2> </div> </section>', $html);
    }

    public function test_section_header_badges_and_version_badge(): void
    {
        $html = $this->render('<x-oc::section-header title="Justify" as="h3" source="CSS class" scss="_a.scss" file="a.html" version="v0.2.0" />');

        $this->assertElement($html, 'h3', 'oc-section-header__title', [], 'Justify');
        $this->assertElement($html, 'span', 'oc-badge-source-scss oc-section-header__badge-scss', [], '_a.scss');
        $this->assertElement($html, 'span', 'oc-badge-source-file oc-section-header__badge-file', [], 'a.html');
        $this->assertSame('<span class="oc-badge-version">v0.17.0</span>', $this->render('<x-oc::version-badge>v0.17.0</x-oc::version-badge>'));
        $this->assertSame('<span class="oc-badge-version-mdi">MDI 7.4</span>', $this->render('<x-oc::version-badge kind="mdi">MDI 7.4</x-oc::version-badge>'));
    }

    public function test_icon_list_pills_tagline_and_note(): void
    {
        $html = $this->render('<x-oc::icon-list variant="accent" :pills="[\'Web app\', \'Since 2020\']" tagline="Plan" note="Resets." :items="[\'A\']" />');

        $this->assertStringContainsString('<div class="oc-badge-row"><span class="oc-pill">Web app</span><span class="oc-pill">Since 2020</span></div>', $html);
        $this->assertElement($html, 'p', 'oc-tagline--accent', [], 'Plan');
        $this->assertElement($html, 'ul', 'oc-list--accent', [], 'A');
        $this->assertElement($html, 'p', 'oc-note', [], 'Resets.');
        $this->assertStringNotContainsString('oc-badge-row', $this->render('<x-oc::icon-list variant="accent" :items="[\'A\']" />'));
    }

    public function test_shot_grid_lightbox(): void
    {
        $html = $this->render('<x-oc::shot-grid lightbox lightbox-id="view" :items="[[\'src\' => \'/a.jpg\', \'alt\' => \'Dashboard\', \'caption\' => \'Dashboard of the day\']]" />');

        $this->assertElement($html, 'button', '', ['command' => 'show-modal', 'commandfor' => 'view-1', 'aria-label' => 'Open the screenshot: Dashboard']);
        $this->assertElement($html, 'dialog', 'oc-lightbox oc-lightbox--single', ['id' => 'view-1', 'aria-label' => 'Dashboard']);
        $this->assertElement($html, 'h2', 'oc-lightbox__title', [], 'Dashboard of the day');
        $this->assertStringNotContainsString('oc-lightbox-thumbs', $html);
        $this->assertStringNotContainsString('<a href="/a.jpg">', $html);
        $this->assertStringContainsString('<a href="/a.jpg">', $this->render('<x-oc::shot-grid :items="[[\'src\' => \'/a.jpg\', \'alt\' => \'A\']]" />'));
    }

    public function test_avatar_picker_sends_wire_model_to_the_input(): void
    {
        $html = $this->render('<x-oc::avatar-picker name="photo" wire:model.live="photo" class="mt-2" :input-attributes="[\'required\' => true]" />');

        $this->assertElement($html, 'div', 'oc-avatar-picker mt-2');
        $this->assertElement($html, 'input', 'oc-avatar-picker__file', ['wire:model.live' => 'photo', 'required' => null, 'name' => 'photo', 'type' => 'file', 'id' => 'oc-avatar-photo']);
        $this->assertDoesNotMatchRegularExpression('/<div[^>]*wire:model/', $html);
    }

    public function test_browser_frame_body(): void
    {
        $html = $this->render('<x-oc::browser-frame body class="oc-accent--blue" body-style="background: red" />');

        $this->assertSame('<div class="oc-browser-frame oc-accent--blue"> <div class="oc-browser-frame__bar"> <i></i><i></i><i></i> </div> <div class="oc-browser-frame__body" style="background: red" ></div> </div>', $html);
        $this->assertElement($this->render('<x-oc::browser-frame body glow src="/s.png" alt="Shot" />'), 'img', 'oc-browser-frame__body', ['src' => '/s.png', 'alt' => 'Shot']);
    }

    public function test_checklist_check_variant(): void
    {
        $html = $this->render('<x-oc::checklist variant="check" :items="[\'No JavaScript needed\', \'Light and dark mode\']" />');

        $this->assertSame('<ul class="oc-check-list"> <li>No JavaScript needed</li> <li>Light and dark mode</li> </ul>', $html);
    }
}
