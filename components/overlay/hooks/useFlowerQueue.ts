// components/overlay/hooks/useFlowerQueue.ts
"use client";

import { useRef, useCallback } from "react";
import type { BloomPayload } from "../types";

export interface BloomJob extends BloomPayload {
    id: string;
}

type JobHandler = (job: BloomJob, done: () => void) => void;

/**
 * Serializes bloom events so polaroid + flower animations
 * never overlap — each waits for the previous to fully complete.
 */
export function useFlowerQueue(onJob: JobHandler) {
    const queueRef = useRef<BloomJob[]>([]);
    const busyRef = useRef(false);
    const handlerRef = useRef(onJob);
    handlerRef.current = onJob;

    const processNext = useCallback(() => {
        if (busyRef.current || queueRef.current.length === 0) return;
        busyRef.current = true;
        const job = queueRef.current.shift()!;
        handlerRef.current(job, () => {
            busyRef.current = false;
            setTimeout(processNext, 150);
        });
    }, []);

    const enqueue = useCallback((payload: BloomPayload) => {
        const job: BloomJob = { ...payload, id: `${Date.now()}-${Math.random()}` };
        queueRef.current.push(job);
        processNext();
    }, [processNext]);

    const clear = useCallback(() => {
        queueRef.current = [];
        busyRef.current = false;
    }, []);

    return { enqueue, clear };
}