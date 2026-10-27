<?php

// File: tests/MediaComponentsTest.php | Map: lightbox -> image zoom -> media thumb / card / row -> stack card
//   -> flip card -> entity card -> emoji picker -> chat composer -> terminal log -> browser frame
// Group C (media and content) Blade components: each renders the same classes as its snippet.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class MediaComponentsTest extends TestCase
{
    public function test_lightbox_renders_dialog_slides_and_wrap_around_links(): void
    {
        $html = $this->render('<x-oc::lightbox id="lb" title="Trip" :images="[[\'alt\' => \'A\'], [\'alt\' => \'B\']]" />');

        $this->assertStringContainsString('command="show-modal" commandfor="lb"', $html);
        $this->assertStringContainsString('<figure class="oc-lightbox__slide" id="lb-1">', $html);
        $this->assertStringContainsString('href="#lb-2" aria-label="Previous photo"', $html);
        $this->assertStringContainsString('<span class="oc-lightbox__counter">2 / 2</span>', $html);
    }

    public function test_image_zoom_checks_the_start_level(): void
    {
        $html = $this->render('<x-oc::image-zoom name="z" :zoom="2" alt="Map" />');

        $this->assertStringContainsString('class="oc-image-zoom"', $html);
        $this->assertStringContainsString('name="z" value="2" checked', $html);
    }

    public function test_media_thumb_card_and_row(): void
    {
        $thumb = $this->render('<x-oc::media-thumb href="/v" duration="4:51" badge="LIVE" live :progress="30" />');
        $this->assertElement($thumb, 'a', 'oc-media-thumb', ['href' => '/v']);
        $this->assertStringContainsString('oc-media-thumb__badge oc-media-thumb__badge--live', $thumb);
        $this->assertStringContainsString('value="30"', $thumb);

        $card = $this->render('<x-oc::media-card id="c" title="Cabin" href="/v" avatar="NS"><x-slot:menu><a class="oc-dropdown-item">Share</a></x-slot:menu></x-oc::media-card>');
        $this->assertStringContainsString('popovertarget="c-menu"', $card);
        $this->assertStringContainsString('<h3 class="oc-media-card__title"><a href="/v">Cabin</a></h3>', $card);

        $row = $this->render('<x-oc::media-row title="Part 2" current />');
        $this->assertElement($row, 'li', 'oc-media-row', ['aria-current' => 'true']);
    }

    public function test_stack_flip_and_entity_cards(): void
    {
        $stack = $this->render('<x-oc::stack-card title="Course" count="8 lessons" panel />');
        $this->assertStringContainsString('class="oc-stack-card oc-stack-card--panel"', $stack);
        $this->assertStringContainsString('<span class="oc-stack-card__count">8 lessons</span>', $stack);

        $flip = $this->render('<x-oc::flip-card id="f"><x-slot:front>Q</x-slot:front><x-slot:back>A</x-slot:back></x-oc::flip-card>');
        $this->assertElement($flip, 'input', 'oc-flip-card__toggle', ['type' => 'checkbox', 'id' => 'f']);
        $this->assertStringContainsString('<label class="oc-flip-card__flip" for="f">Show answer</label>', $flip);

        $entity = $this->render('<x-oc::entity-card title="Ankh" glyph="☥" :facts="[\'Code\' => \'S34\']" />');
        $this->assertStringContainsString('<dt>Code</dt><dd>S34</dd>', $entity);
    }

    public function test_emoji_picker_chat_composer_terminal_log_and_browser_frame(): void
    {
        $emoji = $this->render('<x-oc::emoji-picker id="e" target="#msg" />');
        $this->assertStringContainsString('popovertarget="e"', $emoji);
        $this->assertStringContainsString('data-oc-emoji-target="#msg"', $emoji);

        $chat = $this->render('<x-oc::chat-composer id="m" hint="Shift+Enter" />');
        $this->assertStringContainsString('class="oc-chat-composer__input" id="m"', $chat);
        $this->assertStringContainsString('<span class="oc-chat-composer__hint">Shift+Enter</span>', $chat);

        $log = $this->render('<x-oc::terminal-log :lines="[[\'level\' => \'warn\', \'message\' => \'Careful\']]" prompt />');
        $this->assertStringContainsString('oc-terminal-log__line oc-terminal-log__line--warn', $log);
        $this->assertStringContainsString('class="oc-terminal-log__prompt"', $log);

        $frame = $this->render('<x-oc::browser-frame url="example.com" dark />');
        $this->assertStringContainsString('class="oc-browser-frame oc-browser-frame--dark"', $frame);
        $this->assertStringContainsString('<span class="oc-browser-frame__address">example.com</span>', $frame);
    }
}
