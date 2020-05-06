import * as React from 'react';
import { connect } from 'react-redux';
import { $get } from 'plow-js';

// Neos dependencies are provided by the UI
// @ts-ignore
import { neos } from '@neos-project/neos-ui-decorators';
// @ts-ignore
import { actions } from '@neos-project/neos-ui-redux-store';
import { Button, Icon } from '@neos-project/react-ui-components';

// Media UI dependencies
import { I18nRegistry } from '../../src/interfaces';

interface Asset {
    __identity: string;
}

interface AssetEditorProps {
    i18nRegistry: I18nRegistry;
    value: Asset;
    commit: Function;
    label: string;
    options: object;
    renderSecondaryInspector: Function;
    secondaryEditorsRegistry: {
        get: Function;
    };
    renderHelpIcon: Function;
    flashMessages: {
        add: (id: string, message: string, severity?: string, timeout?: number) => void;
    };
}

@connect(state => ({}), {
    flashMessages: actions.UI.FlashMessages
})
@neos(globalRegistry => ({
    secondaryEditorsRegistry: globalRegistry.get('inspector').get('secondaryEditors')
}))
@neos(globalRegistry => ({
    i18nRegistry: globalRegistry.get('i18n')
}))
export default class AssetEditor extends React.PureComponent<AssetEditorProps> {
    constructor(props: AssetEditorProps) {
        super(props);
        this.state = {};
    }

    handleCloseSecondaryScreen = () => {
        this.props.renderSecondaryInspector(undefined, undefined);
    };

    handleAssetSelected = assetIdentifier => {
        const { commit, value } = this.props;
        const newAsset = {
            __identity: assetIdentifier
        };

        console.debug(newAsset);

        if (value || value.__identity === assetIdentifier) {
            this.handleCloseSecondaryScreen();
            return;
        }
    };

    handleOpenSelectionScreen = () => {
        const { secondaryEditorsRegistry } = this.props;
        const { component: AssetSelectionScreen } = secondaryEditorsRegistry.get(
            'Flowpack.Media.Ui/Secondary/Editors/AssetSelectionScreen'
        );

        this.props.renderSecondaryInspector('ASSET_SELECT', () => (
            <AssetSelectionScreen handleAssetSelected={this.handleAssetSelected} value={this.props.value} />
        ));
    };

    render() {
        const { label } = this.props;
        const disabled = $get('options.disabled', this.props);

        return (
            <div>
                Der Asseteditor ist hier
                <Button
                    style="lighter"
                    disabled={disabled}
                    onClick={() => (disabled ? null : this.handleOpenSelectionScreen())}
                >
                    <Icon icon="pencil" padded="right" label="Edit" />
                    {label}
                </Button>
                {this.props.renderHelpIcon ? this.props.renderHelpIcon() : ''}
            </div>
        );
    }
}
