type Action = {
  action: 'http' | 'view' | 'broadcast';
  label: string;
  url?: string;
  body?: string;
  extras?: Record<string, unknown>;
  intent?: string;
  clear?: boolean;
};

type NtfyMessage = {
  id: string;
  title?: string;
  topic: string;
  tags?: string[];
  message?: string;
  click?: string;
  actions?: Action[];
};

type NtfyMessagePayload = {
  msgType: 'message' | 'ping' | 'clipboard' | 'link';
  headers?: Record<string, string>;
  body: Omit<NtfyMessage, 'id'>;
};

type Dependency = {
  url: string;
  files: { from: string; to: string }[];
  destFolder: string;
};
