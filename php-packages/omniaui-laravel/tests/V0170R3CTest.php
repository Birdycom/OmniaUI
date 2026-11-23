<?php

// File: tests/V0170R3CTest.php
// Map: 0.17.0 round 3C: heading-level (hero, hero-split, hero-code, module-header, profile-header, auth-split, auth page blocks)
//      -> form prop + named slots on the auth page blocks -> sidebar slots -> app-header toggle-for / app-shell toggle-id -> step-view feedback slot

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170R3CTest extends TestCase
{
    public function test_heading_level_defaults_to_h1(): void
    {
        foreach (['hero', 'hero-split', 'hero-code', 'module-header', 'profile-header', 'auth-split', 'login-01', 'signup-02', 'otp-01', 'forgot-password', 'reset-password'] as $block) {
            $html = $this->render("<x-oc::block.{$block} />");
            $this->assertStringContainsString('<h1', $html, $block);
        }
    }

    public function test_heading_level_2_renders_h2_with_the_same_class(): void
    {
        $cases = [
            'hero' => '<h2> Quotes, invoices and stock in one app </h2>',
            'hero-split' => '<h2>',
            'hero-code' => '<h2 class="oc-display">',
            'module-header' => '<h2 class="oc-block-modulehead-title">',
            'profile-header' => '<h2 class="oc-block-profile-name" id="oc-profile-name">',
            'auth-split' => '<h2 class="oc-block-authsplit-title">',
            'login-01' => '<h2 class="oc-block-authcard-title">',
            'login-02' => '<h2 class="oc-block-authcard-title">',
            'login-03' => '<h2 class="oc-block-authcard-title">',
            'signup-01' => '<h2 class="oc-block-authcard-title">',
            'signup-02' => '<h2 class="oc-block-authcard-title">',
            'otp-01' => '<h2 class="oc-block-authcard-title">',
            'otp-02' => '<h2 class="oc-block-authcard-title">',
            'forgot-password' => '<h2 class="oc-block-authcard-title">',
            'reset-password' => '<h2 class="oc-block-authcard-title">',
        ];
        foreach ($cases as $block => $expected) {
            $html = $this->render("<x-oc::block.{$block} heading-level=\"2\" />");
            $this->assertStringContainsString($expected, $html, $block);
            $this->assertStringNotContainsString('<h1', $html, $block);
        }
    }

    public function test_profile_header_name_id_sets_heading_id_and_aria_labelledby(): void
    {
        $html = $this->render('<x-oc::block.profile-header name-id="oc-profile-compact-name" heading-level="2" />');
        $this->assertStringContainsString('aria-labelledby="oc-profile-compact-name"', $html);
        $this->assertStringContainsString('<h2 class="oc-block-profile-name" id="oc-profile-compact-name">', $html);
        $this->assertStringNotContainsString('oc-profile-name"', $html);

        $default = $this->render('<x-oc::block.profile-header />');
        $this->assertStringContainsString('aria-labelledby="oc-profile-name"', $default);
        $this->assertStringContainsString('id="oc-profile-name"', $default);
    }

    public function test_auth_block_form_prop_merges_onto_the_form_and_adds_csrf(): void
    {
        $html = $this->render('<x-oc::block.login-01 :form="[\'wire:submit\' => \'login\', \'action\' => \'/login\']" />');
        $this->assertElement($html, 'form', 'oc-block-authcard', ['action' => '/login', 'method' => 'post', 'wire:submit' => 'login']);
        $this->assertStringContainsString('name="_token"', $html);

        $get = $this->render('<x-oc::block.login-02 :form="[\'method\' => \'get\']" />');
        $this->assertElement($get, 'form', 'oc-block-authcard oc-block-authcard--flat', ['action' => '#', 'method' => 'get']);
        $this->assertStringNotContainsString('name="_token"', $get);

        // Left out: the snippet form (action # / post).
        $this->assertElement($this->render('<x-oc::block.otp-01 />'), 'form', 'oc-block-authcard', ['action' => '#', 'method' => 'post']);
    }

    public function test_auth_block_named_slots_and_strings(): void
    {
        $html = $this->render('<x-oc::block.login-01 title="Sign in" text="Welcome to Company 1"><x-slot:fields><input name="email"><button type="submit">Go</button></x-slot:fields><x-slot:footer>No account? <a href="/register">Register</a></x-slot:footer></x-oc::block.login-01>');
        $this->assertElement($html, 'h1', 'oc-block-authcard-title', [], 'Sign in');
        $this->assertElement($html, 'p', 'oc-block-authcard-text', [], 'Welcome to Company 1');
        $this->assertStringContainsString('<div class="oc-block-authcard-fields"> <input name="email"><button type="submit">Go</button> </div>', $html);
        $this->assertStringNotContainsString('oc-login01-password', $html);
        $this->assertStringContainsString('No account? <a href="/register">Register</a>', $html);
        // The logo tile still comes from the block.
        $this->assertStringContainsString('oc-block-authcard-logo', $html);

        $split = $this->render('<x-oc::block.otp-02><x-slot:panel><aside class="oc-block-authduo-panel oc-block-authduo-panel--photo">Own panel</aside></x-slot:panel></x-oc::block.otp-02>');
        $this->assertStringContainsString('<aside class="oc-block-authduo-panel oc-block-authduo-panel--photo">Own panel</aside>', $split);
        $this->assertStringNotContainsString('oc-block-authduo-panel--muted', $split);

        $social = $this->render('<x-oc::block.login-03><x-slot:social><a href="/auth/apple">Apple</a></x-slot:social><x-slot:legal>Own legal line</x-slot:legal></x-oc::block.login-03>');
        $this->assertStringContainsString('<div class="oc-block-authsocial"> <a href="/auth/apple">Apple</a> </div>', $social);
        $this->assertElement($social, 'p', 'oc-block-authcard-legal', [], 'Own legal line');
    }

    public function test_auth_block_default_slot_still_replaces_everything(): void
    {
        $html = $this->render('<x-oc::block.login-01><form class="own">Own form</form></x-oc::block.login-01>');
        $this->assertStringContainsString('<div class="oc-block-authpage oc-block-authpage--plain"> <form class="own">Own form</form> </div>', $html);
    }

    public function test_sidebar_slots(): void
    {
        $html = $this->render('<x-oc::block.sidebar-01><x-slot:sidebar><aside class="oc-sidebar">Own nav</aside></x-slot:sidebar><x-slot:breadcrumbs><nav aria-label="Breadcrumb">Own crumbs</nav></x-slot:breadcrumbs><x-slot:body><p>Page</p></x-slot:body></x-oc::block.sidebar-01>');
        $this->assertStringContainsString('<aside class="oc-sidebar">Own nav</aside>', $html);
        $this->assertStringNotContainsString('Getting started', $html);
        $this->assertStringContainsString('<nav aria-label="Breadcrumb">Own crumbs</nav>', $html);
        $this->assertStringContainsString('oc-block-sb-sep', $html);
        $this->assertStringContainsString('<div class="oc-block-sb-body"> <p>Page</p> </div>', $html);

        $bar = $this->render('<x-oc::block.sidebar-03><x-slot:bar><button wire:click="toggle">Toggle</button></x-slot:bar></x-oc::block.sidebar-03>');
        $this->assertStringContainsString('<header class="oc-block-sb-bar"> <button wire:click="toggle">Toggle</button> </header>', $bar);

        // Old use: the default slot still takes the whole content.
        $old = $this->render('<x-oc::block.sidebar-02><div class="own"></div></x-oc::block.sidebar-02>');
        $this->assertStringContainsString('<div class="oc-block-sb"> <div class="own"></div> </div>', $old);
    }

    public function test_app_header_toggle_for_and_app_shell_toggle_id(): void
    {
        $this->assertStringContainsString('for="oc-appbar-toggle"', $this->render('<x-oc::block.app-header />'));
        $this->assertStringContainsString('for="oc-shell-toggle"', $this->render('<x-oc::block.app-header toggle-for="oc-shell-toggle" />'));

        $shell = $this->render('<x-oc::block.app-shell toggle-id="main-toggle" />');
        $this->assertStringContainsString('id="main-toggle"', $shell);
        $this->assertStringContainsString('for="main-toggle"', $shell);
        $this->assertStringNotContainsString('oc-shell-toggle"', $shell);

        // The shell checkbox and an app-header with toggle-for line up without a toggle slot.
        $nested = $this->render('<x-oc::block.app-shell><x-slot:header><x-oc::block.app-header toggle-for="oc-shell-toggle" /></x-slot:header></x-oc::block.app-shell>');
        $this->assertStringContainsString('id="oc-shell-toggle"', $nested);
        $this->assertStringContainsString('for="oc-shell-toggle"', $nested);
    }

    public function test_step_view_feedback_slot(): void
    {
        $html = $this->render('<x-oc::block.step-view title="Old gate" :question="[\'text\' => \'Which year?\', \'options\' => [\'1890\', \'1910\'], \'result\' => [\'picked\' => 0, \'correct\' => 1]]"><x-slot:feedback><div class="oc-alert">Not quite</div></x-slot:feedback></x-oc::block.step-view>');
        $this->assertStringContainsString('<div class="oc-alert">Not quite</div>', $html);
        $this->assertElement($html, 'label', 'oc-radio-item oc-radio-item--card', ['data-result' => 'correct']);
        $this->assertStringNotContainsString('oc-block-step-view-send', $html);
    }
}
