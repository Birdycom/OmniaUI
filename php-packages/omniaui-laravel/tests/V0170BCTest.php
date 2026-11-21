<?php

// File: tests/V0170BCTest.php
// Map: hero-media (video / image, scrim, align, reduced-motion source) -> aspect-ratio flush -> definition-list numbered

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170BCTest extends TestCase
{
    public function test_hero_media_video(): void
    {
        $html = $this->render('<x-oc::hero-media src="/media/loop.webm" poster="/media/loop.webp"><h1>Title</h1></x-oc::hero-media>');

        $this->assertStringContainsString('<section class="oc-hero-media oc-hero-media--scrim-start">', $html);
        $this->assertStringContainsString('<video class="oc-hero-media__media" poster="/media/loop.webp" autoplay muted loop playsinline preload="metadata" aria-hidden="true">', $html);
        $this->assertStringContainsString('<source src="/media/loop.webm" type="video/webm" media="(prefers-reduced-motion: no-preference)">', $html);
        $this->assertStringContainsString('<div class="oc-hero-media__content"><h1>Title</h1></div>', $html);
        $this->assertStringNotContainsString('<img', $html);
    }

    public function test_hero_media_image_scrim_and_align(): void
    {
        $img = $this->render('<x-oc::hero-media src="/img/hero.webp" alt="Office of Company 1" scrim="full" align="center" class="x">Body</x-oc::hero-media>');
        $this->assertStringContainsString('<section class="oc-hero-media oc-hero-media--scrim oc-hero-media--center x">', $img);
        $this->assertStringContainsString('<img class="oc-hero-media__media" src="/img/hero.webp" alt="Office of Company 1">', $img);
        $this->assertStringNotContainsString('<video', $img);

        $end = $this->render('<x-oc::hero-media src="/img/hero.jpg" scrim="end" align="end">Body</x-oc::hero-media>');
        $this->assertStringContainsString('<section class="oc-hero-media oc-hero-media--scrim-end oc-hero-media--end">', $end);
        $this->assertStringContainsString('alt=""', $end);

        $none = $this->render('<x-oc::hero-media src="/img/hero.jpg" scrim="none">Body</x-oc::hero-media>');
        $this->assertStringContainsString('<section class="oc-hero-media">', $none);
    }

    public function test_hero_media_type_wins(): void
    {
        $video = $this->render('<x-oc::hero-media src="/stream?id=1" type="video" media-type="video/mp4">Body</x-oc::hero-media>');
        $this->assertStringContainsString('type="video/mp4"', $video);
        $this->assertStringNotContainsString('poster=', $video);

        $image = $this->render('<x-oc::hero-media src="/media/loop.mp4" type="image">Body</x-oc::hero-media>');
        $this->assertStringNotContainsString('<video', $image);
    }

    public function test_aspect_ratio_flush(): void
    {
        $html = $this->render('<x-oc::aspect-ratio ratio="wide" flush><img src="/img/a.webp" alt=""></x-oc::aspect-ratio>');
        $this->assertStringContainsString('<div class="oc-aspect oc-aspect--wide oc-aspect--flush">', $html);
        $this->assertStringContainsString('<div class="oc-aspect">', $this->render('<x-oc::aspect-ratio>x</x-oc::aspect-ratio>'));
    }

    public function test_definition_list_numbered(): void
    {
        $html = $this->render('<x-oc::definition-list numbered glossary :items="[\'Plan\' => \'We listen first.\']" />');
        $this->assertStringContainsString('<dl class="oc-dl oc-dl--glossary oc-dl--numbered">', $html);
        $this->assertStringContainsString('<dl class="oc-dl">', $this->render('<x-oc::definition-list :items="[\'Plan\' => \'We listen first.\']" />'));
    }
}
