// We need to import Icon here, so that we can UNDO the config change to fontawesome-svg-core which happened in "Icon".
// eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
// noinspection ES6UnusedImports
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Icon } from '@neos-project/react-ui-components';
import { config, IconPrefix, library } from '@fortawesome/fontawesome-svg-core';

// Use explicit imports as tree shaking is not working properly
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons/faAngleLeft';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons/faAngleRight';
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan';
import { faBox } from '@fortawesome/free-solid-svg-icons/faBox';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons/faCalendarAlt';
import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faChevronCircleDown } from '@fortawesome/free-solid-svg-icons/faChevronCircleDown';
import { faChevronCircleUp } from '@fortawesome/free-solid-svg-icons/faChevronCircleUp';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp';
import { faClipboard } from '@fortawesome/free-solid-svg-icons/faClipboard';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons/faClipboardCheck';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons/faClipboardList';
import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons/faCloudDownloadAlt';
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import { faExpandAlt } from '@fortawesome/free-solid-svg-icons/faExpandAlt';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt';
import { faFile } from '@fortawesome/free-solid-svg-icons/faFile';
import { faFileAudio } from '@fortawesome/free-solid-svg-icons/faFileAudio';
import { faFileImage } from '@fortawesome/free-solid-svg-icons/faFileImage';
import { faFileVideo } from '@fortawesome/free-solid-svg-icons/faFileVideo';
import { faFolder } from '@fortawesome/free-solid-svg-icons/faFolder';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons/faFolderOpen';
import { faFont } from '@fortawesome/free-solid-svg-icons/faFont';
import { faGripLinesVertical } from '@fortawesome/free-solid-svg-icons/faGripLinesVertical';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import { faImages } from '@fortawesome/free-solid-svg-icons/faImages';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons/faPencilAlt';
import { faPhotoVideo } from '@fortawesome/free-solid-svg-icons/faPhotoVideo';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faSortAmountDown } from '@fortawesome/free-solid-svg-icons/faSortAmountDown';
import { faSortAmountUp } from '@fortawesome/free-solid-svg-icons/faSortAmountUp';
import { faSortDown } from '@fortawesome/free-solid-svg-icons/faSortDown';
import { faTag } from '@fortawesome/free-solid-svg-icons/faTag';
import { faTags } from '@fortawesome/free-solid-svg-icons/faTags';
import { faTh } from '@fortawesome/free-solid-svg-icons/faTh';
import { faThList } from '@fortawesome/free-solid-svg-icons/faThList';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import { faUpload } from '@fortawesome/free-solid-svg-icons/faUpload';

import { faNeos } from '@fortawesome/free-brands-svg-icons/faNeos';
import { faCreativeCommonsZero } from '@fortawesome/free-brands-svg-icons/faCreativeCommonsZero';

config.familyPrefix = 'fa' as IconPrefix;
config.replacementClass = 'svg-inline--fa';

export default function loadIconLibrary() {
    library.add(
        faAngleLeft,
        faAngleRight,
        faBan,
        faBox,
        faCalendarAlt,
        faCamera,
        faCheck,
        faChevronCircleDown,
        faChevronCircleUp,
        faChevronDown,
        faChevronUp,
        faClipboard,
        faClipboardCheck,
        faClipboardList,
        faCloudDownloadAlt,
        faCreativeCommonsZero,
        faDownload,
        faExclamationCircle,
        faExclamationTriangle,
        faExpandAlt,
        faExternalLinkAlt,
        faFile,
        faFileAudio,
        faFileImage,
        faFileVideo,
        faFolder,
        faFolderOpen,
        faFont,
        faGripLinesVertical,
        faImages,
        faInfoCircle,
        faNeos,
        faPencilAlt,
        faPhotoVideo,
        faPlus,
        faQuestion,
        faSpinner,
        faSortAmountDown,
        faSortAmountUp,
        faSortDown,
        faTag,
        faTags,
        faTh,
        faThList,
        faTimes,
        faTimesCircle,
        faTrashAlt,
        faUpload
    );
}
