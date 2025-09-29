import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing function calls
 * 
 * This hook is perfect for scenarios where you want to delay function execution
 * until after a certain period of inactivity. Common use cases include:
 * 
 * @example
 * // API Search calls
 * const debouncedSearch = useDebounceCallback((query: string) => {
 *   searchAPI(query);
 * }, 500);
 * 
 * @example
 * // Form validation
 * const debouncedValidate = useDebounceCallback((formData: FormData) => {
 *   validateForm(formData);
 * }, 300);
 * 
 * @example
 * // Auto-save functionality
 * const debouncedSave = useDebounceCallback((data: any) => {
 *   saveToServer(data);
 * }, 1000);
 * 
 * @example
 * // Resize event handling
 * const debouncedResize = useDebounceCallback(() => {
 *   handleWindowResize();
 * }, 250);
 * 
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced function with the same signature as the original
 */
export const useDebounceCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T => {
  const timeoutRef = useRef<number | undefined>(undefined);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
};

/**
 * Custom hook for debouncing a value (kept for backward compatibility)
 * 
 * Use this when you need to debounce a changing value rather than a function call.
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export const useDebounceState = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}; 


// import { useDebounceCallback } from './useDebounce';

// /**
//  * Example usage patterns for useDebounceCallback hook
//  * This file demonstrates various real-world scenarios where debouncing is useful
//  */

// // Example 1: API Search with debouncing
// export const useSearchAPI = () => {
//   const debouncedSearch = useDebounceCallback(async (query: string) => {
//     if (query.trim()) {
//       try {
//         const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
//         const results = await response.json();
//         console.log('Search results:', results);
//       } catch (error) {
//         console.error('Search failed:', error);
//       }
//     }
//   }, 500);

//   return { debouncedSearch };
// };

// // Example 2: Form validation with debouncing
// export const useFormValidation = () => {
//   const debouncedValidate = useDebounceCallback((fieldName: string, value: string) => {
//     // Simulate validation logic
//     if (fieldName === 'email') {
//       const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
//       console.log(`Email validation: ${isValid ? 'Valid' : 'Invalid'}`);
//     }
//     if (fieldName === 'username') {
//       const isValid = value.length >= 3;
//       console.log(`Username validation: ${isValid ? 'Valid' : 'Too short'}`);
//     }
//   }, 300);

//   return { debouncedValidate };
// };

// // Example 3: Auto-save functionality
// export const useAutoSave = () => {
//   const debouncedSave = useDebounceCallback(async (data: any) => {
//     try {
//       await fetch('/api/auto-save', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data)
//       });
//       console.log('Auto-saved successfully');
//     } catch (error) {
//       console.error('Auto-save failed:', error);
//     }
//   }, 2000); // Save after 2 seconds of inactivity

//   return { debouncedSave };
// };

// // Example 4: Window resize handling
// export const useWindowResize = () => {
//   const debouncedResize = useDebounceCallback(() => {
//     console.log('Window resized:', {
//       width: window.innerWidth,
//       height: window.innerHeight
//     });
//     // Trigger layout recalculations, chart redraws, etc.
//   }, 250);

//   return { debouncedResize };
// };

// // Example 5: Scroll event handling
// export const useScrollHandler = () => {
//   const debouncedScroll = useDebounceCallback(() => {
//     const scrollPosition = window.scrollY;
//     console.log('Scroll position:', scrollPosition);
//     // Update navigation state, load more content, etc.
//   }, 100);

//   return { debouncedScroll };
// };

// // Example 6: Multiple parameter function debouncing
// export const useMultiParamAPI = () => {
//   const debouncedFetch = useDebounceCallback(
//     async (endpoint: string, params: Record<string, any>, options?: RequestInit) => {
//       const url = new URL(endpoint, window.location.origin);
//       Object.entries(params).forEach(([key, value]) => {
//         url.searchParams.append(key, String(value));
//       });

//       try {
//         const response = await fetch(url.toString(), options);
//         const data = await response.json();
//         console.log('API Response:', data);
//         return data;
//       } catch (error) {
//         console.error('API call failed:', error);
//         throw error;
//       }
//     },
//     500
//   );

//   return { debouncedFetch };
// };