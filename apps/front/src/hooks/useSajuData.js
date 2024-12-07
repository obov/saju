import { useState, useEffect } from "react";

const useSajuData = () => {
  const [sajuData, setSajuData] = useState(null);

  useEffect(() => {
    const loadSajuData = async () => {
      try {
        const response = await fetch("/saju_data.csv");
        const csvText = await response.text();
        const rows = csvText.split("\n");

        const data = rows.slice(1).reduce((acc, row) => {
          if (row && row.trim()) {
            const values = row.split(",");
            const date = values[1].trim();
            const sajuString = values[2].trim();
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
