Neos Media Ui
-------------

This package contains the new interface to manage media in Neos CMS (5.2+).

During the initial development the package will be in the Flowpack namespace and will
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
The old media module will still be available until this package replaces it completely with Neos 7.0 (planned).
    
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
but you can define custom policies and an authentication provider to allow access without a user 
and f.e. use a token based authentication.

The API is public and will be stable with the 1.0.0 release.
Until then changes can still happen.

#### Schema

The GraphQL schema can be found [here](Resources/Private/GraphQL/schema.root.graphql). 

### Interface

This module uses React for the implementation of the UI. Currently all components are built with hooks and
integrate with other plugins via hooks.
This gives a lot of flexibility for future extensions and during the current prototype phase of this package.

### State management

#### Query variables

Query related state variables are stored via GraphQL Mutations in the Apollo Client Cache.
Some of those variables are then persisted into the localstorage of the browser.

#### Resolved query result state

The MediaUI provider currently stores the results in its state and provides them to
all child components via provider values.
This will be probably changed to only set shared states than all components can access.

#### Component states

Component state should be stored with React hooks.

#### Shared component states

The shared component states are current implemented via React Recoil.
See the `Resources/Private/JavaScript/src/state` folder for examples.

Those should be used every time multiple components share a state that is not relevant for
the GraphQL queries.

## Fund the development

We need your help to develop this package. You can find supporter badges on the official [Neos funding site](https://neosfunding.sandstorm.de/en).

## Contributing

To start with development make sure you have `nvm` and `yarn` installed and run the following command in the packages folder:

    yarn
    
### Running the standalone dev server without Neos

The dev server allows to run the module without a Neos instance.
This is also the basis for running most tests and implementing new features.

    yarn dev

### Building the module assets

This will create a production build of the module assets.

    yarn build
    
### Recompile files during development

The following command will recompile and reload the media module when changes to the scripts happen:

    yarn watch
    
#### Only watch the backend module code

    yarn watch:module
    
#### Only watch the UI plugin

    yarn watch:ui-plugin

### Check for code quality

Run the following command to verify the TypeScript files:

    yarn lint
    
### Run e2e tests

First start the dev server via `yarn dev` and the run the following command to execute all end-to-end tests: 

    yarn e2e

The test configuration is defined in `.testcaferc.json`. Change the options there if you want to use
a different browser or make some other changes.
    
### Other development hints

#### Register additional icons

Font Awesome icons are registered in `Resources/Private/JavaScript/src/lib/FontAwesome`.
This way the bundle size is kept to a minimum.

#### Patches

Several [patches](patches) are applied during installation via [patch-package](https://github.com/ds300/patch-package).
Additional patches can be generated and stored there with the same tool if necessary.

#### Connection between the backend module and UI plugin

The codebase is 99% reused between the backend module and the asset selection in the Neos UI.
Make sure changes work in both worlds or provide a compatiblity layer in the corresponding initialisation.
    
### Development helpers

* [Extension](https://github.com/apollographql/apollo-client-devtools) for debugging GraphQL schema and queries in the browser
* [Plugin](https://plugins.jetbrains.com/plugin/8097-js-graphql) for code completion and helpers in PHPStorm

## License

See [license](LICENSE).
