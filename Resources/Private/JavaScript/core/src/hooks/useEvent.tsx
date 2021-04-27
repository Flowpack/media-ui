import { MediaEvent } from '../events';

export default function useEvent<T>(event: MediaEvent<T>): MediaEvent<T> {
    return event;
}
