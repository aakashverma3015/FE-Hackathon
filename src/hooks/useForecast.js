/**
 * Aarohan Agri — useForecast hook
 * Fetches 30-day AI/statistical price forecast from backend.
 * Caches result per (cropName + days) in component state.
 *
 * Returns: { forecastData, loading, error, refetch }
 */
import { useState, useEffect, useCallback } from 'react';
import { mandiAPI } from '../lib/api';

export function useForecast(cropName, days = 30) {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const fetchForecast = useCallback(async () => {
    if (!cropName) return;
    setLoading(true);
    setError(null);

    try {
      const res = await mandiAPI.getForecast(cropName, days);
      if (res && (res.forecast || res.success)) {
        setForecastData(res);
      } else {
        throw new Error('Empty forecast response');
      }
    } catch (err) {
      console.warn(`useForecast: ${cropName} forecast failed —`, err.message);
      setError(err.message);
      // Set a minimal fallback so the UI doesn't stay blank
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  }, [cropName, days]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return {
    forecastData,
    loading,
    error,
    refetch: fetchForecast,
    // Convenient derived values
    forecast:       forecastData?.forecast       || [],
    trend:          forecastData?.trend          || 'neutral',
    confidence:     forecastData?.confidence     || 0,
    insight:        forecastData?.insight        || '',
    bestTimeToSell: forecastData?.bestTimeToSell || '',
    method:         forecastData?.method         || 'unknown',
    history:        forecastData?.history        || [],
    currentPrice:   forecastData?.currentPrice   || 0,
    predictedPrice: forecastData?.predictedPrice || 0,
  };
}
