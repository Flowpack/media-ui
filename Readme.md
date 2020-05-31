Neos Media Ui
-------------

This package contains the new interface to manage media in Neos CMS.

During the development the package will be in the Flowpack namespace and will
later replace `neos/media-browser`. Having two modules allows us currently to install
them both and be able to test them without losing features.

If you want to use Neos, please have a look at the [Neos documentation](http://neos.readthedocs.org/en/stable/).

## Installation

Add the following source to your composer.json

    {
      "type": "vcs",
      "url": "https://github.com/Flowpack/media-ui.git"
    }

Run the following command to install it

    composer require flowpack/media-ui 
    
### What changes?

This package will currently add a second media backend module called `Media (new)` and a new 
media selection screen for asset and image editors.
The old media module will still be available until this package replaces it completely.
    
#### Disabling the new media selection

If you want to use this package in a real project you might want to 
disable the new media selection if it doesn't work as expected.
You can do this by adding the following setting to your `Settings.yaml`:

    Neos:
        Neos:
            Ui:
                frontendConfiguration:
                    Flowpack.Media.Ui:
                        useNewMediaSelection: false 
    
## Architecture

### API / GraphQL

This module introduces a GraphQL API for the Neos Media system.
The API is open and can be reused for custom apps. A valid Neos backend user is required to access it,
but you can define custom policies and an authentication provider to allow access without a user.

### Interface

This module uses React for the implementation of the UI. Currently all components are built with hooks and
integrate with other plugins via hooks.
This gives a lot of flexibility for future extensions and during the current prototype phase of this package.

## Contributing

To start with development make sure you have `nvm` and `yarn` installed and run the following command in the packages folder:

    yarn

### Building the module assets

This will create a production build of the module assets.

    yarn build
    
### Recompile files during development

The following command will recompile and reload the media module when changes to the scripts happen:

    yarn watch

### Check for code quality

Run the following command to verify the TypeScript files:

    yarn lint

### Development helpers

* [Extension](https://github.com/apollographql/apollo-client-devtools) for debugging GraphQL schema and queries in the browser
* [Plugin](https://plugins.jetbrains.com/plugin/8097-js-graphql) for code completion and helpers in PHPStorm
