const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = AIzaSyBLq9lyFBclBm9ms7hcrW_ELfLMrdv_YfE;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model:"gemini-2.5-pro-exp-03-25",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  const safetySettings=[
    {
        category:HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold:HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category:HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold:HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category:HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold:HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category:HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold:HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    }
  ];

  export const chatSession = model.startChat({
      generationConfig,
      safetySettings,
    });

