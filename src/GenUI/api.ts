/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ScalprumComponentProps } from '@scalprum/react-core';

export type RegistryProps<P = {}> = ScalprumComponentProps<
  {},
  { props: P; contextId: string }
>;

export type StreamChunk =
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

export function isStreamChunk(value: any): value is StreamChunk {
  return (
    typeof value === 'object' &&
    (value.type === 'text' ||
      value.type === 'component' ||
      value.type === 'done')
  );
}

export function isTextChunk(
  value: any,
): value is { type: 'text'; content: string } {
  return isStreamChunk(value) && value.type === 'text';
}

export function isComponentChunk(
  value: any,
): value is { type: 'component'; component: RegistryProps } {
  return isStreamChunk(value) && value.type === 'component';
}

export function isDoneChunk(value: any): value is { type: 'done' } {
  return isStreamChunk(value) && value.type === 'done';
}

export async function updateContext(context: {
  conversation_id: string;
  contextId: string;
  contextData: Record<string, any>;
}) {
  const response = await fetch(`/context`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(context),
  });

  if (!response.ok) {
    throw new Error('Failed to update context');
  }
}
