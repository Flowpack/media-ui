// We need to import Icon here, so that we can UNDO the config change to fontawesome-svg-core which happened in "Icon".
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Icon from '@neos-project/react-ui-components/lib-esm/Icon/index';
import { config, IconPrefix, library } from '@fortawesome/fontawesome-svg-core';
import {
    faTimesCircle,
    faTag,
    faTags,
    faExpandAlt,
    faFolderOpen,
    faFolder,
    faTh,
    faThList,
    faFileVideo,
    faFileAudio,
    faFile,
    faFileImage
} from '@fortawesome/free-solid-svg-icons';
import { faNeos } from '@fortawesome/free-brands-svg-icons';

config.familyPrefix = 'fa' as IconPrefix;
config.replacementClass = 'svg-inline--fa';

export default function loadIconLibrary() {
    library.add(
        faTimesCircle,
        faTag,
        faTags,
        faExpandAlt,
        faFolderOpen,
        faFolder,
        faNeos,
        faTh,
        faThList,
        faFileVideo,
        faFileAudio,
        faFile,
        faFileImage
    );
}
