import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { Confirm } from './dialogs';

interface InteractionContextValues {
    element: null | React.ReactElement;
    setElement: (element: null | React.ReactElement) => void;
}

const InteractionContext = createContext<InteractionContextValues>({} as InteractionContextValues);

interface InteractionProviderProps {
    children: React.ReactElement;
}

export const InteractionProvider: React.FC<InteractionProviderProps> = ({ children }: InteractionProviderProps) => {
    const [element, setElementWithoutCheck] = useState<null | React.ReactElement>(null);
    const setElement = useCallback(
        (newElement: React.ReactElement) => {
            if (element === null) {
                setElementWithoutCheck(newElement);
            } else {
                throw new Error('[InteractionProvider]: Element cannot be overwritten if it is already set.');
            }
        },
        [element]
    );

    return <InteractionContext.Provider value={{ element, setElement }}>{children}</InteractionContext.Provider>;
};

export const InteractionDialogRenderer: React.FC = () => {
    const { element } = useContext(InteractionContext);
    return element;
};

export type Interaction = ReturnType<typeof useInteraction>;

export const useInteraction = () => {
    const { setElement } = useContext(InteractionContext);
    const confirm = useCallback(
        async (options: { title: string; message: string; buttonLabel: string }) => {
            try {
                return await new Promise<boolean>((resolve) => {
                    setElement(
                        <Confirm
                            title={options.title}
                            message={options.message}
                            buttonLabel={options.buttonLabel}
                            onConfirm={() => resolve(true)}
                            onDeny={() => resolve(false)}
                        />
                    );
                });
            } finally {
                setElement(null);
            }
        },
        [setElement]
    );

    return useMemo(() => ({ confirm }), [confirm]);
};
