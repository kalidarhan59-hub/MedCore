import { ChatMessage, HealthMetric } from '../types';

export const analyzeSymptoms = async (chatHistory: ChatMessage[]) => {
  const res = await fetch('/api/analyze-symptoms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatHistory })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'API error');
  }
  return res.json(); // { text, risk, nextStep }
};

export const analyzeMetrics = async (metrics: HealthMetric[]) => {
  const res = await fetch('/api/analyze-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metrics })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'API error');
  }
  return res.json(); // { status, trend, advice, correlation }
};

export const analyzeImage = async (imageBase64: string, comment: string) => {
  const res = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, comment })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'API error');
  }
  return res.json(); // { analysis }
};

export const generateWorkoutPlan = async (metrics: HealthMetric[]) => {
  const res = await fetch('/api/generate-workout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metrics })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'API error');
  }
  return res.json(); // { plan: [], recommendation: string }
};
