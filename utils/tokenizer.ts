/** 
import { v4 as uuidv4 } from 'uuid';

interface Chunk {
  id: string;
  content: string;
}
*/
export const tokenizeContent = (content: string): string[] => {
  const chunks = [''];
  let lastSeenChar = '';
  let isCodeBlock = false;
  let codeBlockDelimiterCount = 0;
  let isTable = false;
  content = `## Headers

# H1 Header
## H2 Header
### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header
`;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    // detect code block start/end by looking for triple backticks
    if (char === '`') {
      codeBlockDelimiterCount += 1;

      if (codeBlockDelimiterCount === 3) {
        isCodeBlock = !isCodeBlock; // toggle code block
        codeBlockDelimiterCount = 0;
      }
    } else {
      codeBlockDelimiterCount = 0; // reset if not a backtick
    }

    if (char === '|') {
      isTable = true;
      if (
        chunks.length > 1 &&
        chunks[chunks.length - 2].length >= 100 &&
        isTable &&
        lastSeenChar === '\n'
      ) {
        // remove the existing chunk and append to the previous chunk
        const lastChunk = chunks.pop();
        chunks[chunks.length - 1] += lastChunk;
      }
    }

    // add to the current chunk if within a code block or if chunk is under the limit
    if (
      !isCodeBlock &&
      chunks[chunks.length - 1].length >= 300 &&
      codeBlockDelimiterCount === 0 &&
      char === '\n'
    ) {
      chunks.push(char); // start a new chunk if the current one exceeds 300 chars
    } else {
      chunks[chunks.length - 1] += char; // add character to current chunk
    }
    lastSeenChar = char;
  }

  console.log('output of tokenize is: ', chunks);
  return chunks;
};
