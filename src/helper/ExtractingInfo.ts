import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import {JSDOM} from 'jsdom'
import { PythonShell } from 'python-shell';
import RecursiveSplitting from '../lib/storeEmbedding'
import { chromium } from 'playwright';

const turndownService = new TurndownService({
    headingStyle: 'atx',        // "# H1"
    emDelimiter: '*',           // use *italic* instead of _italic_
    bulletListMarker: '-',      // "- item"
    codeBlockStyle: 'fenced'    // ``` fences
});
turndownService.addRule("removeSvg", {
    // filter selects which elements the rule applies to
    filter: (node) => node.nodeName.toLowerCase() === "svg",
    // replacement decides what to output instead of the element
    replacement: () => {
        return ""; // Replace SVG with nothing (i.e., remove it)
    },
});

export type URLArray={
    link:string,
    visited:boolean,
    title?: string
}

async function ExtractingCleanHTML(URLArray:URLArray[]) {
    return Promise.all(
        URLArray.map(async (URL) => {
            try {
                const response = await fetch(URL.link);
                const htmlbody = await response.text();
                const dom = new JSDOM(htmlbody, {
                    url: URL.link
                });
                const reader = new Readability(dom.window.document);
                const parsed = reader.parse();
                if (!parsed || !parsed.content) {
                    throw new Error("Failed to parse HTML content");
                }
                const cleanUPHTML = parsed.content;

                turndownService.remove(['aside']);
                const rawMarkdown = turndownService.turndown(cleanUPHTML).trim();

                URL.visited=true
                return RecursiveSplitting(rawMarkdown,"web",URL.title,URL.link);
            } catch (error) {
                console.log(`Error while scrapping data from ${URL.link}`, error);
            }
        })
    ).then(async ()=>{
        console.log("Mongoose client closed!")
        return
    })
}

async function ExtractfromPdf(pdfPath:string) {
    return new Promise((resolve, reject) => {
        let options = {
            mode: 'text' as const,
            pythonPath: 'py', // Use Windows Python launcher
            pythonOptions: ['-u'], // unbuffered output
            scriptPath: __dirname,
            args: [pdfPath]
        };

        PythonShell.run('pdf_processor.py', options).then(messages => {
            console.log("Python script ran");
            try {
                // The Python script now only outputs the JSON
                const jsonLine = messages[0];
                // console.log("Attempting to parse JSON:", jsonLine);
                const result = JSON.parse(jsonLine);
                if (result.status === 'success') {
                    console.log("Success! Text length:", result.text.length);
                    let combinedLink = result.filename;
                    resolve(RecursiveSplitting(result.text, "static", undefined, combinedLink));
                } else {
                    reject(new Error(result.error));
                }
            } catch (error) {
                console.error("JSON parsing error:", error);
                console.error("Raw messages:", messages);
                reject(new Error('Failed to parse Python script output'));
            }
        }).catch((err:any )=> {
            console.error("PythonShell error:", err);
            reject(err);
        });
    });
}

export default {ExtractingCleanHTML,ExtractfromPdf}