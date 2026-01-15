import { useState, useEffect } from 'react';
import mondaySdk from 'monday-sdk-js';

const monday = mondaySdk();
monday.setApiVersion('2024-10');

export function useMonday() {
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Listen for context changes
    const unsubscribe = monday.listen('context', (res) => {
      if (isMounted && res.data) {
        setContext(res.data);
        setLoading(false);
      }
    });

    // Also try to get context directly
    monday.get('context').then((res) => {
      if (isMounted && res.data) {
        setContext(res.data);
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Error getting context:', err);
    });

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Context loading timeout');
        setLoading(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { monday, context, loading };
}
