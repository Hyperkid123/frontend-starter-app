/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  AfterChunkCallback,
  ClientInitLimitation,
  IAIClient,
  IConversation,
  IInitErrorResponse,
  ISendMessageOptions,
  IStreamChunk,
  IStreamingHandler,
} from '@redhat-cloud-services/ai-client-common';
import { createClientStateManager } from '@redhat-cloud-services/ai-client-state';
import {
  RegistryProps,
  isComponentChunk,
  isStreamChunk,
  isTextChunk,
} from './api';

export type AdditionalAttributes = {
  components: RegistryProps[];
  contextId: string;
};

class DefaultStreamingHandler implements IStreamingHandler {
  private messageBuffer: IStreamChunk<AdditionalAttributes> = {
    answer: '',
    messageId: crypto.randomUUID(),
    additionalAttributes: {
      components: [],
      contextId: '',
    },
  };
  resetMessageBuffer() {
    this.messageBuffer = {
      answer: '',
      messageId: crypto.randomUUID(),
      additionalAttributes: {
        contextId: '',
        components: [],
      },
    };
  }
  onStart(): void {
    this.resetMessageBuffer();
  }
  onChunk(
    chunk: string,
    afterChunk?: AfterChunkCallback<AdditionalAttributes>,
  ): void {
    console.log({ chunk });
    chunk.split('\n').forEach((line) => {
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
          this.messageBuffer.answer += parsedChunk.content;
        }

        if (isComponentChunk(parsedChunk)) {
          this.messageBuffer.additionalAttributes.components.push(
            parsedChunk.component,
          );
        }
        afterChunk?.(this.messageBuffer);
      } catch (error) {
        throw new Error(`Failed to parse chunk: ${chunk}`, { cause: error });
      }
    });
  }

  onComplete(): void {
    this.resetMessageBuffer();
  }

  async processStream(
    response: Response,
    afterChunk?: AfterChunkCallback<AdditionalAttributes>,
  ) {
    if (!afterChunk) {
      throw new Error('AfterChunk callback is required');
    }
    this.onStart();
    if (!response.body) {
      throw new Error('Response body is not readable');
    }
    const reader = response.body.getReader();
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
          this.onChunk(chunk, afterChunk);
        } catch (error) {
          throw new Error(`Failed to parse chunk: ${chunk}`, { cause: error });
        }
      });
    }
  }
}

export class MCPClient implements IAIClient<AdditionalAttributes> {
  private baseUrl: string;
  private streamingHandler: IStreamingHandler;

  constructor() {
    this.baseUrl = window.location.origin;
    this.streamingHandler = new DefaultStreamingHandler();
  }

  getDefaultStreamingHandler() {
    return this.streamingHandler;
  }
  createNewConversation(): Promise<IConversation> {
    return Promise.resolve({
      id: crypto.randomUUID(),
      locked: false,
      title: 'New conversation',
      createdAt: new Date(),
      messages: [],
    });
  }

  async getConversationHistory() {
    return [];
  }

  async healthCheck(): Promise<unknown> {
    return true;
  }

  async init(): Promise<{
    conversations: IConversation[];
    limitation?: ClientInitLimitation;
    error?: IInitErrorResponse;
  }> {
    return {
      conversations: [],
    };
  }

  async sendMessage(
    conversationId: string,
    message: string,
    options?: ISendMessageOptions,
  ) {
    console.log({ message, options });
    if (!options?.afterChunk) {
      throw new Error('AfterChunk callback is required for streaming');
    }
    const response = await fetch(this.baseUrl + '/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        message: message,
      }),
    });
    // @ts-ignore
    return processStream(response, this.streamingHandler, options.afterChunk);
  }
}

export async function processStream(
  response: Response,
  handler: IStreamingHandler<string>,
  afterChunk?: AfterChunkCallback<AdditionalAttributes>,
) {
  if (handler instanceof DefaultStreamingHandler) {
    handler.processStream(response, afterChunk);
  }
}

const MCPClientModule = new MCPClient();
const stateManager = createClientStateManager(MCPClientModule);

export default stateManager;
