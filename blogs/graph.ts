
// https://github.com/tscpp/remark-mermaid-ssr/blob/main/index.ts
// https://github.com/mermaid-js/mermaid-cli/blob/master/src/index.js

import * as puppeteer from 'puppeteer';
import type { MermaidConfig } from 'mermaid';
import { visit, Visitor } from 'unist-util-visit';
import fs from "fs/promises"

async function renderSvg(definition: string, page: puppeteer.Page, config: MermaidConfig, style: string) {

  return page.evaluate(async (definition, config, style) => {
    // @ts-ignore
    const { mermaid } =  globalThis;
    mermaid.initialize({ startOnLoad: false, ...config });
    const container = document.createElement('div');
    const { svg: svgText } = await mermaid.render('mermaid-graph', definition);
    container.innerHTML = svgText;
    container.className += 'flex justify-center';
    container.style.lineHeight = '1em';
    const svg = container.childNodes[0]
    if (style) {
      // add CSS as a <svg>...<style>... element
      // see https://developer.mozilla.org/en-US/docs/Web/API/SVGStyleElement
      const node = document.createElementNS('http://www.w3.org/2000/svg', 'style')
      node.appendChild(document.createTextNode(style))
      svg.appendChild(node)

    }

    return container.outerHTML
  }, definition, config, style);

}

// export async function someTest() {

//   const source = `graph TD;
//   A-->B;
//   A-->C;
//   B-->D;
//   C-->D;
//   `
//   const browser = await puppeteer.launch({headless: 'shell'});
//   const page = await browser.newPage();
//   page.on('console', (msg) => {
//     console.log(msg.text())
//   });

//   let result;
//   try {
//     await page.evaluate(await fs.readFile('node_modules/mermaid/dist/mermaid.min.js', 'utf-8'));
//     result = await renderSvg(source, page, {}, '');
//   } finally {
//     await page.close()
//   }

//   await browser.close()
//   return result;
// }

export default function mermaidGraph(options: MermaidConfig) {

  return async function transformer(ast: any) {

    const data: any[] = [];
    const visitor: Visitor<any> = ({lang, value}, index, parent) => {
      if (lang !== 'mermaid') return;
      data.push({value, index, parent});
    };

    visit(ast, 'code', visitor, true);

    if (!data.length) return ast;

    const mermaidJs = await fs.readFile('node_modules/mermaid/dist/mermaid.min.js', 'utf-8')
    const styleText = [
      '.messageLine0, path.transition { stroke:#5b5b5b !important; }',
      '.messageText, #arrowhead path, #mermaid-graph_statediagram-barbEnd { fill:#5b5b5b !important; }',
      '#mermaid-graph .edgeLabel { background: none; color: #888; -webkit-text-stroke-width: 0.3px; -webkit-text-stroke-color: #333; }'
    ].join(' ')

    await Promise.all(
      data.map(async ({ value, index, parent }) => {
        const browser = await puppeteer.launch({headless: 'shell'});
        const page = await browser.newPage();
        try {
          page.on('console', (msg) => console.log(msg.text()));
          await page.evaluate(mermaidJs);
          const svg = await renderSvg(value, page, {theme: 'neutral'}, styleText);
          parent.children.splice(index, 1, { type: 'html', value: svg });
        } finally {
          await page.close()
          await browser.close()
        }
      })
    );
  
    return ast;
  };
}