const apiKey = "AIzaSyCb6bQP7buKdzbdblnJe-ura8nONicn8Ws";
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const FOOD_ANALYSIS_PROMPT = "Analyze this food image and provide a detailed nutritional estimate. RESPOND ONLY WITH VALID JSON.";

const body = {
contents: [{
  parts: [
    {
      inline_data: {
        mime_type: "image/png",
        data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      }
    },
    {
      text: FOOD_ANALYSIS_PROMPT
    }
  ]
}],
generationConfig: {
  temperature: 0.2,
  maxOutputTokens: 512,
}
};

fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(body),
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
