declare global {
    const os: {
        homedir: () => string;
    };
    const path: {
        join: (...p: string[]) => string;
    };
}

export {};
