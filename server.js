require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();

const PORT = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());

app.use(express.static(path.join(__dirname)));


// ================================
// AI GENERATION API
// ================================

app.post("/api/generate", async (req, res) => {

  try {

    const {
      task,
      topic,
      requirements,
      language
    } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: "Project topic is required."
      });
    }

    const taskInstructions = {

      project_ideas:
        "Generate 5 innovative student project ideas. For each include title, problem, solution, features and technologies.",

      problem_statement:
        "Write a clear college-level project problem statement. Explain the existing problem, limitations and why the proposed system is needed.",

      objectives:
        "Generate clear and measurable project objectives. Give at least 6 objectives.",

      tech_stack:
        "Suggest an appropriate technology stack. Explain frontend, backend, database, AI/ML technologies, APIs and deployment options.",

      ppt:
        "Create complete PPT content for the project. Include title, introduction, problem statement, objectives, existing system, proposed system, features, architecture, technologies, workflow, advantages, limitations, future scope and conclusion.",

      viva:
        "Generate 20 important viva questions and answers that a college student can understand and explain easily.",

      complete_project:
        "Provide complete project guidance including title, abstract, problem statement, objectives, modules, features, architecture, workflow, technologies, database, AI components, implementation steps, testing, future scope, PPT structure and viva questions."

    };

    const instruction =
      taskInstructions[task] ||
      taskInstructions.complete_project;


    const prompt = `
You are an AI Student Innovation Assistant.

Help a college student create and explain a practical technology project.

PROJECT TOPIC:
${topic}

STUDENT REQUIREMENTS:
${requirements || "No additional requirements provided."}

LANGUAGE:
${language}

TASK:
${instruction}

IMPORTANT RULES:

1. Use simple language suitable for a college student.
2. Give practical and technically realistic information.
3. Do not pretend that a feature exists if it does not.
4. Do not say this is a demo.
5. Do not return fake API responses.
6. Clearly structure the answer using headings and numbered lists.
7. Include examples where useful.
8. If AI/ML is involved, explain the AI component simply.
9. Make the content suitable for a college project presentation.
`;


    const completion =
      await client.chat.completions.create({

        model: process.env.OPENAI_MODEL || "gpt-4o-mini",

        messages: [

          {
            role: "system",
            content:
              "You are a helpful AI assistant specializing in student projects, software development, AI and academic presentations."
          },

          {
            role: "user",
            content: prompt
          }

        ],

        temperature: 0.7,

        max_tokens: 2500

      });


    const result =
      completion.choices?.[0]?.message?.content;

    if (!result) {

      return res.status(500).json({
        error: "The AI returned an empty response."
      });

    }


    res.json({
      result
    });


  } catch (error) {

    console.error("AI ERROR:", error);

    res.status(500).json({
      error:
        error?.message ||
        "Unable to connect to the AI service."
    });

  }

});


app.listen(PORT, () => {

  console.log(
    `AI Student Assistant running at http://localhost:${PORT}`
  );

});
