type Action = {
  action: 'http' | 'view' | 'broadcast';
  label: string;
  url?: string;
  body?: string;
  extras?: Record<string, unknown>;
  intent?: string;
  clear?: boolean;
};

type Message = {
  id: string;
  title: string;
  topic: string;
  tags?: string[];
  message?: string;
  click?: string;
  actions?: Action[];
};

type PayloadForMessage = {
  msgType: 'message' | 'ping' | 'clipboard' | 'link';
  headers?: Record<string, string>;
  body: Omit<Message, 'id'>;
};
