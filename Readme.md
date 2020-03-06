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
