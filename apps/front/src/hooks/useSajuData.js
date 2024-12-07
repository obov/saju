import { useState, useEffect } from "react";

const useSajuData = () => {
  const [sajuData, setSajuData] = useState(null);

  useEffect(() => {
    const loadSajuData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}?filename=mansae.csv`
        );
        const { url } = await response.json();

        const fileResponse = await fetch(url);
        const csvText = await fileResponse.text();

        const rows = csvText.split("\n");

        const data = rows.slice(1).reduce((acc, row) => {
          // row example: 금,1988-03-04,戊辰年 甲寅月 戊午日,-,1988-01-16,戊辰年 甲寅月 戊午日

          if (row && row.trim()) {
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
          }
          return acc;
        }, {});

        setSajuData(data);
      } catch (error) {
        console.error("Error loading saju data:", error);
      }
    };

    loadSajuData();
  }, []);

  return sajuData;
};

export default useSajuData;
