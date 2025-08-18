/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScalprumComponentProps } from '@scalprum/react-core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type RegistryProps<P = {}> = ScalprumComponentProps<{}, { props: P }>;

type StreamChunk =
  | {
      type: 'text';
      content: string;
    }
  | {
      type: 'component';
      component: RegistryProps;
    }
  | {
      type: 'done';
    };

export type StreamResponse = {
  content: string;
  components: RegistryProps[];
  loading: boolean;
};

function isStreamChunk(value: any): value is StreamChunk {
  return (
    typeof value === 'object' &&
    (value.type === 'text' ||
      value.type === 'component' ||
      value.type === 'done')
  );
}

function isTextChunk(value: any): value is { type: 'text'; content: string } {
  return isStreamChunk(value) && value.type === 'text';
}

function isComponentChunk(
  value: any,
): value is { type: 'component'; component: RegistryProps } {
  return isStreamChunk(value) && value.type === 'component';
}

function isDoneChunk(value: any): value is { type: 'done' } {
  return isStreamChunk(value) && value.type === 'done';
}

export async function streamedData(onChunk: (chunk: StreamResponse) => void) {
  try {
    const streamResponse: StreamResponse = {
      content: '',
      components: [],
      loading: true,
    };
    onChunk(streamResponse);

    const response = await fetch('/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Show me a header that says Hello World',
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const body = await response.body;
    if (!body) {
      throw new Error('Response body is null');
    }
    const reader = body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const lines = decoder.decode(value, { stream: !done });
      lines.split('\n').forEach((line) => {
        const chunk = line.replace(/^data: /, '').trim();
        if (chunk.length === 0) {
          return;
        }
        try {
          const parsedChunk = JSON.parse(chunk);
          if (!isStreamChunk(parsedChunk)) {
            throw new Error(`Invalid stream chunk: ${chunk}`);
          }

          if (isTextChunk(parsedChunk)) {
            streamResponse.content += parsedChunk.content;
          }

          if (isComponentChunk(parsedChunk)) {
            streamResponse.components.push(parsedChunk.component);
          }

          if (isDoneChunk(parsedChunk)) {
            done = true;
            streamResponse.loading = false;
          }
          onChunk(streamResponse);
        } catch (error) {
          throw new Error(`Failed to parse chunk: ${chunk}`, { cause: error });
        }
      });
    }
    onChunk({ ...streamResponse, loading: false });
  } catch (error) {
    console.error('Error occurred while streaming data:', error);
    onChunk({
      content: '',
      components: [],
      loading: false,
    });
  }
}
