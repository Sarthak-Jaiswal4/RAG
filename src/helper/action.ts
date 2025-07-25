import webSearch from './webSearch'
import ExtractingInfo from './ExtractingInfo'
import querySearching from '@/lib/querySearching'
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { Root, Table, TableRow, TableCell, List, ListItem, Paragraph, Content, PhrasingContent, Parent } from 'mdast';

// // 1) Parse the Markdown into an AST
// function parseMarkdown(md: string): Root {
//   return unified()
//     .use(remarkParse)
//     .parse(md) as Root;
// }

// interface Bullet {
//   text: string;
//   children: Bullet[];
// }

// function extractTextFromParagraph(para: Paragraph): string {
//   return para.children
//     .map(node => {
//       switch (node.type) {
//         case 'text':
//           return node.value
//         case 'strong':
//           return node.children
//             .map(c => (c.type === 'text' ? c.value : ''))
//             .join('')
//         case 'link':
//           // include link text and URL in parentheses
//           const linkText = node.children
//             .map(c => (c.type === 'text' ? c.value : ''))
//             .join('')
//           return `${linkText} (${node.url})`
//         default:
//           // include other inline types if needed
//           return ''
//       }
//     })
//     .join('')
//     .trim()
// }

// /**
//  * Recursively extract a nested bullet tree.
//  *
//  * Only paragraphs immediately followed by a list become bullets,
//  * and standalone lists are also parsed.
//  */
// export function extractBulletTree(node: Parent): Bullet[] {
//   const result: Bullet[] = []

//   function walk(parent: Parent, into: Bullet[]) {
//     const children = parent.children as Parent[]
//     for (let i = 0; i < children.length; i++) {
//       const child = children[i]

//       // Pattern: Paragraph directly followed by a list
//       if (child.type === 'paragraph') {
//         const next = children[i + 1]
//         if (next && next.type === 'list') {
//           const para = child as Paragraph
//           const text = extractTextFromParagraph(para)
//           const nodeBullet: Bullet = { text, children: [] }
//           into.push(nodeBullet)
//           walk(next as Parent, nodeBullet.children)
//           i++ // skip consumed list
//         }
//         continue
//       }

//       // Standalone list
//       if (child.type === 'list') {
//         ;(child as List).children.forEach((item: ListItem) => {
//           // First paragraph in list item
//           const para = item.children.find(c => c.type === 'paragraph') as Paragraph | undefined
//           const text = para ? extractTextFromParagraph(para) : ''
//           const nodeBullet: Bullet = { text, children: [] }
//           into.push(nodeBullet)
//           // Recurse into nested lists inside this item
//           item.children.forEach(grand => {
//             if ((grand as any).type === 'list') {
//               walk(grand as Parent, nodeBullet.children)
//             }
//           })
//         })
//         continue
//       }

//       // Recurse into other nodes
//       if ('children' in child) {
//         walk(child as Parent, into)
//       }
//     }
//   }

//   walk(node, result)
//   return result
// }

// /** 2. Given a Table node, extract its rows as JS objects */
// function tableToObjects(table: Table): Record<string, string>[] {
//     // Extract header cells
//     const headerRow = table.children[0] as TableRow;
//     const headers = headerRow.children.map((cell) =>
//       // flatten each header cell's inline content to text
//       flattenCellText(cell as TableCell).trim()
//     );
  
//     // Iterate data rows
//     return table.children.slice(1).map((rowNode) => {
//       const row = rowNode as TableRow;
//       const cells = row.children as TableCell[];
//       const obj: Record<string, string> = {};
  
//       headers.forEach((header, i) => {
//         const cell = cells[i];
//         obj[header] = flattenCellText(cell).trim();
//       });
  
//       return obj;
//     });
//   }
  
//   /** 3. Flatten a cell’s children (paragraphs, strong, text, etc.) into one string */
//   function flattenCellText(cell: TableCell): string {
//     return cell.children
//       .map((node: Content) => {
//         // text nodes
//         if (node.type === "text" && 'value' in node) return node.value;
//         // paragraphs, strong, emphasis, etc.
//         if ("children" in node) {
//           return (node.children as Content[]).map((n) =>
//             n.type === "text" && 'value' in n ? n.value : ""
//           ).join("");
//         }
//         return "";
//       })
//       .join(" ");
//   }

interface QueryAnalysis {
    original: string;
    paraphrases: string[];
    sub_questions: string[];
    broader_related: string[];
}

export const shoudldosearch=async(query:string)=>{
    const resp=await webSearch.ShouldSearch(query)
    return resp
}

export const DoWebSearch=async(decision:string,confidence:number,query:string,type?:string)=>{
    try {
        if(decision=="ANSWER" && confidence>=6 && type!='Web Search'){
            console.log('LLM responding to query...')
            const resp=await webSearch.DoChat(query)
            console.log(resp)
            return resp
        }
        else{
            console.log('LLM performing web search...')
            if(type=='Deep Research'){
                try {
                    console.log("performing deep search")
                    const reQueryStr=await webSearch.QueryRewriting(query)
                    const allURLs=await webSearch.DeepSearchGetlinks(reQueryStr)
                    const saved=await ExtractingInfo.ExtractingCleanHTML(allURLs)
                    const response= await RetriveFromDb(query,type)
                    // console.log(response)
                    return response 
                } catch (error:any) {
                    console.log('Error in performing deep research web search',error)
                    throw new Error(error) 
                }
            }
            try {
                console.log("performing normal search")
                const urls=await webSearch.DoWebSearch(query,type)
                const saved=await ExtractingInfo.ExtractingCleanHTML(urls)
                const response= await RetriveFromDb(query,type)
                // console.log(response)
                return response 
            } catch (error:any) {
                console.log('Error in performing web search',error)
                throw new Error(error) 
            }
        }
    } catch (error:any) {
        throw new Error('Error in Web search action',error)
    }
}

export const RetriveFromDb=async(query:string,type?:string)=>{
    try {
        const reponse=await querySearching.QueryEmbedding(query,type)
        if(reponse){
            // const ast = parseMarkdown(reponse);
            // const tables = ast.children.filter((n) => n.type === "table") as Table[];
            // console.log("table--",tables)
            // // parse the table of malls
            // // const malls = extractMallTable(ast);
            // // parse any bullet‑pointed introduction
            // const bullets = extractBulletTree(ast);
            // console.log("bullet points-----",bullets)
            return reponse
        }
    } catch (error:any) {
    throw new Error('Error in Retrieval from DB', error)
    }
}