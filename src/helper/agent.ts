import { createAgent, gemini } from '@inngest/agent-kit';


export const StepPlannerAgent=async(query:any)=>{

    const StepPlanner = createAgent({
      name: 'step_planner',
      model: gemini({
            model:'gemini-2.5-flash',
            apiKey:process.env.GOOGLE_API_KEY
        }),
      system:
      `You are the Designer Agent. Your role is to convert a user's natural language request into a clean, structured graph representation of a diagram. 
        You should NOT generate Excalidraw JSON. 
        Instead, produce a high-level intermediate representation with nodes and edges.
    
        Rules:
        - Each node must have: id, label, and type (action, process, decision, start, end, entity, etc.).
        - Each edge must define "from", "to", and optionally a "condition".
        - Output strictly in JSON format.
        - Do not add styling, positions, or colors.
    
        Your job is planning and structuring the diagram logically.
        `
    });
    
    const response= await StepPlanner.run(`
        User request: ${query}
    
        Convert this request into a graph structure with nodes and edges. 
        Output JSON only.
    `)
    const raw:any = response.output[0];
    return raw
}

export const Jsongenerator = async ({input}:{input:string}) => {
    const agentInstance = createAgent({
        name: "jsonGenerator",
        model: gemini({
            model: 'gemini-2.5-flash',
            apiKey: process.env.GOOGLE_API_KEY
        }),
        system: `
        You are an Excalidraw JSON Generator Agent.

        Your ONLY job is to output valid JSON for Excalidraw diagrams.

        Rules:
        - Output must be a valid JSON object with the exact structure:
        {
            "elements": [ ... ]
        }
        - "elements" must be a flat array of Excalidraw elements.
        - Each element must follow the Excalidraw schema: 
        { id, type, x, y, width, height, angle, strokeColor, backgroundColor, fillStyle, strokeWidth, strokeStyle, roughness, opacity, roundness, seed, version, versionNonce, isDeleted, boundElements, updated, fontSize, fontFamily, text, textAlign, verticalAlign, containerId, ... }
        - Allowed types: "rectangle", "ellipse", "diamond", "arrow", "text".
        - Text must always be a separate element, positioned inside or above its shape.
        - Never output \`\`\`json or \`\`\` fences, never add explanations or comments.
        - The response must be directly parsable with JSON.parse().
        - Never include extra keys like "type": "excalidraw" or "frames".
        `
    });
    const agentResult = await agentInstance.run(`
        Graph input:
        ${input}

        Convert this graph into Excalidraw JSON. Output only the JSON.
    `);
    const response: any = agentResult.output[0];
    return response;
}

export const ReThinkingAgent = async ({ query, json }: { query: string, json: string }) => {
    const Rethink = createAgent({
        name: "Rethinking_Agent",
        model: gemini({
            model: 'gemini-2.5-flash',
            apiKey: process.env.GOOGLE_API_KEY
        }),
        system: `
            You are an Excalidraw JSON Generator.

            Your ONLY job is to output valid Excalidraw JSON in this exact format:

            {
            "elements": [
                {
                "id": "unique_id",
                "type": "rectangle" | "ellipse" | "diamond" | "arrow" | "text",
                "x": <number>,
                "y": <number>,
                "width": <number>,
                "height": <number>,
                "angle": 0,
                "strokeColor": "black",
                "backgroundColor": "transparent" | "lightblue" | "lightgreen" | any valid CSS color,
                "fillStyle": "hachure",
                "strokeWidth": 1,
                "strokeStyle": "solid",
                "roughness": 1,
                "opacity": 100,
                "roundness": null or { "type": 3 },
                "seed": <random number>,
                "version": 1,
                "versionNonce": <random number>,
                "isDeleted": false,
                "boundElements": [],
                "updated": 1678886400000,
                // For text only:
                "fontSize": 16,
                "fontFamily": 1,
                "text": "Label here",
                "rawText": "Label here",
                "textAlign": "center",
                "verticalAlign": "middle"
                }
            ]
            }

            ⚠️ Rules:
            1. Do NOT wrap output in \`\`\`json ... \`\`\` fences.
            2. Do NOT include any root keys like "type": "excalidraw".
            The only root key should be "elements".
            3. Always return a single JSON object with "elements".
            4. Each node must have its own "text" element if it needs a label (don’t rely on "label").
            5. When adding new parts, append them to the existing "elements" array instead of replacing it.
            6. Use arrows (\`type: "arrow"\`) to connect nodes.
            7. Every element must have a unique "id".
        `
    });

    const agent = await Rethink.run(`
        User request: ${query}

        Existing diagram JSON: ${json}    
    `);

    const resposne:any=agent.output[0]
    return resposne
}

export const ReJsonAgent=async({inijson,newjson}:{inijson:string,newjson:string})=>{
    const Rethink=createAgent({
        name:"Rethinking_Agent",
        model:gemini({
            model:'gemini-2.5-flash',
            apiKey:process.env.GOOGLE_API_KEY
        }),
        system:`
        You are an Excalidraw JSON Generator Agent.

        Your ONLY job is to output valid JSON for Excalidraw diagrams.

        Rules:
        - Output must be a valid JSON object with the exact structure:
        {
            "elements": [ ... ]
        }
        - "elements" must be a flat array of Excalidraw elements.
        - Each element must follow the Excalidraw schema: 
        { id, type, x, y, width, height, angle, strokeColor, backgroundColor, fillStyle, strokeWidth, strokeStyle, roughness, opacity, roundness, seed, version, versionNonce, isDeleted, boundElements, updated, fontSize, fontFamily, text, textAlign, verticalAlign, containerId, ... }
        - Allowed types: "rectangle", "ellipse", "diamond", "arrow", "text".
        - Text must always be a separate element, positioned inside or above its shape.
        - Never output \`\`\`json or \`\`\` fences, never add explanations or comments.
        - The response must be directly parsable with JSON.parse().
        - Never include extra keys like "type": "excalidraw" or "frames".
        `
    });

    const agent=await Rethink.run(`
        Here is the existing diagram JSON: ${inijson}
        Here is the sub-flow plan from Agent A: ${newjson}
        Generate the updated Excalidraw JSON with the new sub-flow appended.    
    `)

    const response:any=agent.output[0]
    return response
}