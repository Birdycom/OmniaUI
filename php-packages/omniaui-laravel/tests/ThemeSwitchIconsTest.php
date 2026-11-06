<?php

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

/** 0.15.0: theme switch with monitor / sun / moon webicons (icons only, or icon + text). */
class ThemeSwitchIconsTest extends TestCase
{
    public function test_icons_only_keeps_the_text_for_screen_readers_and_as_tooltip(): void
    {
        $html = $this->render('<x-oc::theme-switch :icons="true" />');

        $this->assertStringContainsString('class="oc-theme-switch oc-theme-switch--icons"', $html);
        $this->assertStringContainsString('<iconify-icon icon="mdi:weather-night" aria-hidden="true"></iconify-icon>', $html);
        $this->assertStringContainsString('<span class="oc-theme-switch__text">Light</span>', $html);
        $this->assertStringContainsString('title="System"', $html);
    }

    public function test_icon_and_text_and_default_without_icons(): void
    {
        $text = $this->render('<x-oc::theme-switch icons="text" />');
        $this->assertStringContainsString('mdi:monitor', $text);
        $this->assertStringNotContainsString('oc-theme-switch--icons', $text);
        $this->assertStringNotContainsString('oc-theme-switch__text', $text);

        $plain = $this->render('<x-oc::theme-switch />');
        $this->assertStringNotContainsString('iconify-icon', $plain);
        $this->assertStringContainsString('Dark</label>', $plain);
    }
}
