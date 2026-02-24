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

    toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),

    setStep: (step) => set({ currentStep: step }),

    simulatePayment: async () => {
        const { setStep } = get();

        // Auth step (KMS/Paymaster)
        setStep('auth');
        await new Promise((r) => setTimeout(r, 1200));

        // AI Risk calculation (Bedrock)
        setStep('ai-risk');
        // Animate score changes
        set({ fraudScore: 45, confidence: 80 });
        await new Promise((r) => setTimeout(r, 600));
        set({ fraudScore: 12, confidence: 99.1 });
        await new Promise((r) => setTimeout(r, 1000));

        // Gas Prediction
        setStep('gas-prediction');
        await new Promise((r) => setTimeout(r, 1500));

        // Swap Selection
        setStep('swap');
        await new Promise((r) => setTimeout(r, 1200));

        // Settlement
        setStep('settlement');
        set({ latencyNs: Math.floor(Math.random() * 100) + 400 });
        await new Promise((r) => setTimeout(r, 2000));

        // Complete
        setStep('complete');
    },

    resetDemo: () => set({
        currentStep: 'idle',
        fraudScore: 12,
        confidence: 98.4,
        latencyNs: 450
    })
}));
