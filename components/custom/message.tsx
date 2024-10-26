'use client';

import { Attachment, ToolInvocation } from 'ai';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

import { Markdown } from './markdown';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';

export const Message = ({
  role,
  content,
  toolInvocations,
  attachments,
}: {
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  const [chunks, setChunks] = useState<string[]>([]);

  useEffect(() => {
    const delimiter = '\n';
    let consecutiveLines = 0;
    let inCodeblock = false;
    let inTable = false;
    let tableContent = '';

    const messageChunks: string[] = [];
    let currentChunk = '';
    // ensure content is always a string
    const contentString = content as string;

    contentString.split(delimiter).forEach((line, index, lines) => {
      // detect the start or end of a code block
      if (line.startsWith('```')) {
        inCodeblock = !inCodeblock;
      }

      // check table row
      if (line.startsWith('|') && line.endsWith('|\n')) {
        if (!inTable) {
          inTable = true;
          tableContent += line;
        }
      } else if (inTable) {
        // check if this line is the end of the table
        const startWithPipe = lines[index + 1]?.trim().startsWith('|');
        if (line.endsWith('|\n') && !startWithPipe) {
          inTable = false;
          messageChunks.push(tableContent.trim() + '\n');
          tableContent = '';
        } else {
          // table row
          tableContent += line;
        }
      } else if (!inCodeblock) {
        if (line === '' && currentChunk.trim() !== '') {
          messageChunks.push(currentChunk.trim() + '\n\n');
          currentChunk = '';
        } else {
          currentChunk += line + '\n';
        }
      } else {
        // Inside a code block, just append the line
        currentChunk += line + '\n';
      }
    });

    // Push any remaining content
    if (tableContent.trim() !== '') {
      messageChunks.push(tableContent.trim() + '\n\n');
    } else if (currentChunk.trim() !== '') {
      messageChunks.push(currentChunk.trim() + '\n\n');
    }

    setChunks(messageChunks);
  }, [content]);

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={role}
    >
      <div className="flex gap-4 group-data-[role=user]/message:px-5 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-3.5 group-data-[role=user]/message:bg-muted rounded-xl">
        {role === 'assistant' && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <Sparkles className="size-4" />
          </div>
        )}
        <div className="flex flex-col gap-2 w-full">
          {content && (
            <div className="flex flex-col gap-4">
              <Markdown>{content as string}</Markdown>
            </div>
          )}

          {toolInvocations && toolInvocations.length > 0 ? (
            <div className="flex flex-col gap-4">
              {toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === 'result') {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === 'getWeather' ? (
                        <Weather weatherAtLocation={result} />
                      ) : null}
                    </div>
                  );
                } else {
                  return (
                    <div key={toolCallId} className="skeleton">
                      {toolName === 'getWeather' ? <Weather /> : null}
                    </div>
                  );
                }
              })}
            </div>
          ) : null}

          {attachments && (
            <div className="flex flex-row gap-2">
              {attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
