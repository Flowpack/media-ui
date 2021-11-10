import * as tus from 'tus-js-client';
import { UploadOptions } from 'tus-js-client';

export default function useUploadFiles(options: UploadOptions) {
    const uploadFiles = (files: File[]) => {
        files.forEach((file) => {
            options.metadata = {
                filename: file.name,
                filetype: file.type,
            };
            const upload = new tus.Upload(file, options);

            upload.findPreviousUploads().then((previousUploads) => {
                if (previousUploads.length) {
                    upload.resumeFromPreviousUpload(previousUploads[0]);
                }
                upload.start();
            });
        });
    };

    return { uploadFiles };
}
