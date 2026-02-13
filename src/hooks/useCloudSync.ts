import { useCloudSync } from '../context/CloudSyncContext';

export const useCloudSyncHook = () => {
    return useCloudSync();
};
