// We need to import Icon here, so that we can UNDO the config change to fontawesome-svg-core which happened in "Icon".
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Icon } from '@neos-project/react-ui-components';
import { config, IconPrefix, library } from '@fortawesome/fontawesome-svg-core';

// Use explicit imports as tree shaking is not working properly
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { faTag } from '@fortawesome/free-solid-svg-icons/faTag';
import { faTags } from '@fortawesome/free-solid-svg-icons/faTags';
import { faExpandAlt } from '@fortawesome/free-solid-svg-icons/faExpandAlt';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons/faFolderOpen';
import { faFolder } from '@fortawesome/free-solid-svg-icons/faFolder';
import { faTh } from '@fortawesome/free-solid-svg-icons/faTh';
import { faThList } from '@fortawesome/free-solid-svg-icons/faThList';
import { faFileVideo } from '@fortawesome/free-solid-svg-icons/faFileVideo';
import { faFileAudio } from '@fortawesome/free-solid-svg-icons/faFileAudio';
import { faFile } from '@fortawesome/free-solid-svg-icons/faFile';
import { faFileImage } from '@fortawesome/free-solid-svg-icons/faFileImage';
import { faPhotoVideo } from '@fortawesome/free-solid-svg-icons/faPhotoVideo';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons/faAngleRight';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons/faAngleLeft';
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faChevronCircleUp } from '@fortawesome/free-solid-svg-icons/faChevronCircleUp';
import { faSortDown } from '@fortawesome/free-solid-svg-icons/faSortDown';
import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';

import { faNeos } from '@fortawesome/free-brands-svg-icons/faNeos';

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
        faFileImage,
        faPhotoVideo,
        faPlus,
        faTrashAlt,
        faInfoCircle,
        faAngleRight,
        faAngleLeft,
        faQuestion,
        faChevronDown,
        faChevronCircleUp,
        faSortDown,
        faBox
    );
}
