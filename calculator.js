const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;
const WINDOW_SIZE = 10;
const numberQueue = new Array(WINDOW_SIZE);
let head = 0;
let tail = 0;

app.get('/numbers/:numberid', async (req, res) => {
  const numberid = req.params.numberid;

  // Fetch numbers from the third-party server
  const response = await fetchNumbers(numberid);

  if (response) {
    const numbers = response.data;

    // Store the fetched numbers
    storeNumbers(numbers);

    // Calculate the average
    const avg = calculateAverage();

    // Format the response
    const formattedResponse = formatResponse(numbers, avg);

    res.json(formattedResponse);
  } else {
    res.status(500).json({ error: 'Error fetching numbers' });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on port ${PORT}");
});

const fetchNumbers = async (numberid) => {
  try {
    const response = await axios.get("https://third-party-server.com/numbers/${numberid}");
    return response;
  } catch (error) {
    console.error("Error fetching numbers:${error}");
  }
};

const storeNumbers = (numbers) => {
  for (const num of numbers) {
    if (tail < WINDOW_SIZE && !numberQueue.includes(num)) {
      numberQueue[tail] = num;
      tail++;
    }

    if (tail === WINDOW_SIZE) break;
  }

  if (head < tail) head++;
};

const calculateAverage = () => {
  let sum = 0;
  let count = 0;

  for (let i = head; i < tail; i++) {
    sum += numberQueue[i];
    count++;
  }

  return sum / count;
};

const formatResponse = (numbers, avg) => {
  return {
    "windowPrevState": numberQueue.slice(0, head),
    "windowCurrState": numberQueue.slice(head, tail),
    "numbers": numbers,
    "avg": parseFloat(avg.toFixed(2))
  };
};