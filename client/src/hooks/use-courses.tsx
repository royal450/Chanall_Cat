import { useFirebaseServices } from './use-firebase-realtime';
import type { Service } from "@/types/course";

export function useServices() {
  const { services, loading, error, updateServiceInteraction, createService } = useFirebaseServices();
  
  return {
    services: services as Service[],
    loading,
    error,
    updateServiceInteraction,
    createService
  };
}

// Backward compatibility exports
export function useChannels() {
  const { services, loading, updateServiceInteraction } = useServices();
  return {
    channels: services,
    loading,
    updateChannelInteraction: updateServiceInteraction
  };
}

export function useCourses() {
  const { services, loading, updateServiceInteraction } = useServices();
  return {
    courses: services,
    loading,
    updateCourseInteraction: updateServiceInteraction
  };
}

// Export for default import compatibility
export { useServices as default };
