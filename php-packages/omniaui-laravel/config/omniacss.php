<?php

// File: config/omniacss.php | Map: source -> cdn -> public -> vite -> packages

return [

    /*
    |--------------------------------------------------------------------------
    | Stylesheet source used by the @omniacss directive
    |--------------------------------------------------------------------------
    |
    | vite   - your own Vite entry (resources/css/app.css imports the packages)
    | cdn    - jsDelivr links to the minified @birdycom/* builds
    | public - files copied to public/<public.path> (omniacss:install --source=public)
    |
    */
    'source' => env('OMNIACSS_SOURCE', 'vite'),

    /*
    |--------------------------------------------------------------------------
    | Packages to load
    |--------------------------------------------------------------------------
    |
    | core       - utilities and tokens (@birdycom/omniacss)
    | components - component CSS (@birdycom/omniaui)
    | blocks     - page block CSS (@birdycom/omniaui-blocks)
    |
    */
    'packages' => [
        'core' => true,
        'components' => true,
        'blocks' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Version used for CDN links (npm version or range)
    |--------------------------------------------------------------------------
    */
    'version' => env('OMNIACSS_VERSION', '0.12.3'),

    'cdn' => [
        'base' => 'https://cdn.jsdelivr.net/npm',
    ],

    'public' => [
        // Relative to public/. Used for asset('<path>/<file>.min.css').
        'path' => 'vendor/omniacss',
    ],

    'vite' => [
        // Entry that imports the OmniaCSS packages.
        'entries' => ['resources/css/app.css'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Blade
    |--------------------------------------------------------------------------
    |
    | prefix - component prefix: <x-oc::button>. Published components
    |          (omniacss:publish-components) are used as <x-oc.button>.
    |
    */
    'prefix' => 'oc',

];
