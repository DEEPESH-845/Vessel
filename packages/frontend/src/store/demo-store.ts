import { create } from 'zustand';

export type DemoStep =
    | 'idle'
    | 'auth'
    | 'ai-risk'
    | 'gas-prediction'
    | 'swap'
    | 'settlement'
    | 'complete';

interface DemoState {
    isDemoMode: boolean;
    currentStep: DemoStep;
    fraudScore: number;
    confidence: number;
    gasPredicted: number;
    gasActual: number;
    latencyNs: number;
    currentRunId: string | null;

    toggleDemoMode: () => void;
    setStep: (step: DemoStep) => void;
    simulatePayment: () => Promise<void>;
    resetDemo: () => void;
}

export const useDemoStore = create<DemoState>((set, get) => ({
    isDemoMode: true,
    currentStep: 'idle',
    fraudScore: 12,
    confidence: 98.4,
    gasPredicted: 0.005,
    gasActual: 0.0048,
    latencyNs: 450,
    currentRunId: null,

    toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),

    setStep: (step) => set({ currentStep: step }),

    simulatePayment: async () => {
        const runId = Math.random().toString(36).substring(7);
        set({ currentRunId: runId });

        const { setStep } = get();

        // Auth step (KMS/Paymaster)
        if (get().currentRunId !== runId) return;
        setStep('auth');
        await new Promise((r) => setTimeout(r, 1500));

        // AI Risk calculation (Bedrock)
        if (get().currentRunId !== runId) return;
        setStep('ai-risk');
        // Animate score changes rapidly for effect
        set({ fraudScore: 45, confidence: 80 });
        await new Promise((r) => setTimeout(r, 400));
        if (get().currentRunId !== runId) return;
        set({ fraudScore: 12, confidence: 99.1 });
        await new Promise((r) => setTimeout(r, 1200));

        // Gas Prediction
        if (get().currentRunId !== runId) return;
        setStep('gas-prediction');
        await new Promise((r) => setTimeout(r, 1500));

        // Swap Selection
        if (get().currentRunId !== runId) return;
        setStep('swap');
        await new Promise((r) => setTimeout(r, 1000));

        // Settlement
        if (get().currentRunId !== runId) return;
        setStep('settlement');
        set({ latencyNs: Math.floor(Math.random() * 50) + 120 });
        await new Promise((r) => setTimeout(r, 2000));

        // Complete
        if (get().currentRunId !== runId) return;
        setStep('complete');
        set({ currentRunId: null });
    },

    resetDemo: () => set({
        currentStep: 'idle',
        fraudScore: 12,
        confidence: 98.4,
        gasPredicted: 0.005,
        gasActual: 0.0048,
        latencyNs: 450,
        currentRunId: null
    })
}));
