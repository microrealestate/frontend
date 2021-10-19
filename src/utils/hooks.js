import { useCallback, useEffect, useRef, useState } from 'react';

export const useComponentMountedRef = () => {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => (mountedRef.current = false);
  });

  return mountedRef;
};

export const useTimeout = (fn, delay) => {
  const mountedRef = useComponentMountedRef();
  const fnRef = useRef(fn);
  const timerRef = useRef();
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const clear = useCallback(() => {
    timerRef.current && clearTimeout(timerRef.current);
  }, []);

  const start = useCallback((...params) => {
    clear();
    setIsRunning(true);
    timerRef.current = setTimeout(async () => {
      if (mountedRef.current && fnRef.current) {
        await fnRef.current(...params);
        setIsRunning(false);
        setIsDone(true);
      }
    }, delay);
  }, []);

  return { start, clear, isRunning, isDone };
};
