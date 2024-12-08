import { useState, useEffect } from "react";

// 상수 정의
const CACHE_NAME = "saju-data-cache-v1";
const CACHE_KEY = `${import.meta.env.VITE_BACKEND_API_URL}?filename=mansae.csv`;
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24시간

const useSajuData = () => {
  const [sajuData, setSajuData] = useState(null);

  useEffect(() => {
    const loadSajuData = async () => {
      const cachedData = await getCachedData();
      if (cachedData) {
        console.log("Using cached saju data");
        setSajuData(cachedData);
        return;
      }

      try {
        console.log("Fetching fresh saju data");
        const freshData = await fetchSajuData();

        await cacheData(freshData);
        setSajuData(freshData);
      } catch (error) {
        console.error("Error loading saju data:", error);

        const fallbackData = await getCachedData();
        if (fallbackData) {
          console.log("Using cached data after error");
          setSajuData(fallbackData);
        }
      }
    };

    loadSajuData();
  }, []);

  return sajuData;
};

export default useSajuData;

/**
 * 캐시에서 데이터 가져오기
 */
const getCachedData = async () => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(CACHE_KEY);
    if (!cachedResponse) return null;

    const data = await cachedResponse.json();
    const timestamp = cachedResponse.headers.get("timestamp");
    const now = Date.now();

    if (!timestamp || now - parseInt(timestamp, 10) >= CACHE_EXPIRY)
      return null;

    return data;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
};

/**
 * API에서 데이터 가져오기
 */
const fetchSajuData = async () => {
  const response = await fetch(CACHE_KEY);
  const { url } = await response.json();

  const fileResponse = await fetch(url);
  const csvText = await fileResponse.text();

  const rows = csvText.split("\n");
  return rows.slice(1).reduce((acc, row) => {
    if (!row || !row.trim()) return acc;

    const values = row.split(",");
    const date = values[1].trim();
    const sajuString = values[5].trim();
    const [year, month, day] = sajuString.split(" ");

    acc[date] = {
      yearGan: year[0],
      yearZhi: year[1],
      monthGan: month[0],
      monthZhi: month[1],
      dayGan: day[0],
      dayZhi: day[1],
    };
    return acc;
  }, {});
};

/**
 * 데이터를 캐시에 저장하기
 */
const cacheData = async (data) => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const headers = new Headers({
      timestamp: Date.now().toString(),
      "content-type": "application/json",
    });

    const cacheResponse = new Response(JSON.stringify(data), { headers });
    await cache.put(CACHE_KEY, cacheResponse.clone());
    console.log("Data cached successfully");
  } catch (error) {
    console.error("Error caching data:", error);
  }
};
